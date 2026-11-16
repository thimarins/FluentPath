# Fluent Path - servidor local portátil (PowerShell nativo do Windows, nada a instalar).
# Serve o app em http://localhost:PORTA/ e salva o progresso em data\progress.json (com backups diários).
# Fecha sozinho quando você fecha a janela do app.
param([int]$Port = 8765, [switch]$NoBrowser, [string]$DataDir = '')
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$app = Join-Path $root 'app'
$data = if ($DataDir) { $DataDir } else { Join-Path $root 'data' }  # -DataDir permite testar sem tocar no seu progresso
$bak = Join-Path $data 'backups'
$state = Join-Path $data 'progress.json'
$log = Join-Path $data 'server.log'
New-Item -ItemType Directory -Force -Path $data, $bak | Out-Null
function Log($m) { try { Add-Content -Path $log -Value ("{0:yyyy-MM-dd HH:mm:ss}  {1}" -f (Get-Date), $m) -Encoding UTF8 } catch { } }
if (Test-Path $log) { if ((Get-Item $log).Length -gt 200KB) { Remove-Item $log -Force } }
Log '--- start'

# escolhe uma porta livre (a partir de 8765)
$listener = $null
for ($p = $Port; $p -lt $Port + 20; $p++) {
  try { $l = New-Object System.Net.HttpListener; $l.Prefixes.Add("http://localhost:$p/"); $l.Start(); $listener = $l; $Port = $p; break } catch { Log "porta $p ocupada: $($_.Exception.Message)" }
}
if (-not $listener) { Log 'sem porta livre'; throw 'Nenhuma porta livre entre 8765 e 8784.' }
Set-Content -Path (Join-Path $data 'server.pid') -Value $PID
Set-Content -Path (Join-Path $data 'server.port') -Value $Port
$url = "http://localhost:$Port/"
Log "ouvindo em $url (pid $PID)"

function Open-App($u) {
  $cands = @(
    "$env:ProgramFiles (x86)\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "$env:ProgramFiles (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe")
  $exe = $cands | Where-Object { Test-Path $_ } | Select-Object -First 1
  if ($exe) {
    $prof = Join-Path (Join-Path $root 'runtime') 'browser-profile'; New-Item -ItemType Directory -Force -Path $prof | Out-Null
    Start-Process -FilePath $exe -ArgumentList @("--app=$u", "--user-data-dir=`"$prof`"", '--no-first-run', '--no-default-browser-check', '--window-size=1280,860')
    Log "janela do app: $exe"
  } else { Start-Process $u; Log 'navegador padrão' }
}
if (-not $NoBrowser) { Open-App $url }

$mime = @{ '.html' = 'text/html; charset=utf-8'; '.js' = 'application/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.json' = 'application/json; charset=utf-8'; '.png' = 'image/png'; '.svg' = 'image/svg+xml'; '.ico' = 'image/x-icon'; '.webmanifest' = 'application/manifest+json' }
$utf8 = New-Object System.Text.UTF8Encoding($false)
function Send($ctx, [int]$code, [byte[]]$bytes, [string]$type, [bool]$nocache = $true) {
  $r = $ctx.Response; $r.StatusCode = $code; $r.ContentType = $type
  if ($nocache) { $r.Headers['Cache-Control'] = 'no-store' }
  $r.ContentLength64 = $bytes.Length; $r.OutputStream.Write($bytes, 0, $bytes.Length); $r.OutputStream.Close()
}
function SendText($ctx, [int]$code, [string]$text, [string]$type = 'text/plain; charset=utf-8') { Send $ctx $code ($utf8.GetBytes($text)) $type }
function Rotate-Backups {
  Get-ChildItem $bak -Filter 'progress-*.json' | Sort-Object Name -Descending | Select-Object -Skip 14 | Remove-Item -Force -ErrorAction SilentlyContinue
}

$last = Get-Date; $seen = $false; $started = Get-Date
try {
  while ($listener.IsListening) {
    $task = $listener.GetContextAsync()
    while (-not $task.AsyncWaitHandle.WaitOne(1000)) {
      if (-not $seen -and ((Get-Date) - $started).TotalMinutes -gt 10) { Log 'nenhuma janela conectou em 10 min: encerrando'; $listener.Stop(); break }
      if ($seen -and ((Get-Date) - $last).TotalSeconds -gt 150) { Log 'janela fechada: encerrando'; $listener.Stop(); break }
    }
    if (-not $listener.IsListening) { break }
    $ctx = $task.GetAwaiter().GetResult(); $req = $ctx.Request
    try {
      $path = $req.Url.AbsolutePath
      $hostOk = ($req.Url.Host -eq 'localhost' -or $req.Url.Host -eq '127.0.0.1')
      if (-not $hostOk) { SendText $ctx 403 'forbidden'; continue }
      if ($path.StartsWith('/api/')) {
        # proteção: só o próprio app (cabeçalho customizado + mesma origem) pode ler/gravar o progresso
        $org = $req.Headers['Origin']
        if ($req.Headers['X-FluentPath'] -ne '1' -or ($org -and $org -ne $url.TrimEnd('/'))) { SendText $ctx 403 'forbidden'; continue }
        if ($path -eq '/api/ping') { $last = Get-Date; $seen = $true; SendText $ctx 200 'ok'; continue }
        if ($path -eq '/api/info') { $last = Get-Date; $seen = $true; SendText $ctx 200 (@{ path = $state; port = $Port; version = 1 } | ConvertTo-Json -Compress) 'application/json; charset=utf-8'; continue }
        if ($path -eq '/api/quit') { SendText $ctx 200 'bye'; $listener.Stop(); break }
        if ($path -eq '/api/state') {
          $last = Get-Date; $seen = $true
          if ($req.HttpMethod -eq 'GET') {
            if (Test-Path $state) { SendText $ctx 200 ([IO.File]::ReadAllText($state, $utf8)) 'application/json; charset=utf-8' } else { SendText $ctx 404 'none' }
            continue
          }
          if ($req.HttpMethod -eq 'PUT' -or $req.HttpMethod -eq 'POST') {
            $reader = New-Object System.IO.StreamReader($req.InputStream, $utf8); $body = $reader.ReadToEnd(); $reader.Close()
            if ($body.Length -lt 20 -or -not $body.TrimStart().StartsWith('{')) { SendText $ctx 400 'invalid'; continue }
            if (Test-Path $state) {
              $day = Join-Path $bak ("progress-{0:yyyy-MM-dd}.json" -f (Get-Date))
              if (-not (Test-Path $day)) { Copy-Item $state $day -Force; Rotate-Backups }
            }
            $tmp = "$state.tmp"; [IO.File]::WriteAllText($tmp, $body, $utf8); Move-Item -Force $tmp $state
            SendText $ctx 200 'saved'; continue
          }
        }
        SendText $ctx 404 'not found'; continue
      }
      # arquivos estáticos (somente dentro de \app)
      $rel = [Uri]::UnescapeDataString($path.TrimStart('/')); if ([string]::IsNullOrEmpty($rel)) { $rel = 'index.html' }
      $full = [IO.Path]::GetFullPath((Join-Path $app $rel))
      if (-not $full.StartsWith([IO.Path]::GetFullPath($app), [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $full -PathType Leaf)) { SendText $ctx 404 'not found'; continue }
      $ext = [IO.Path]::GetExtension($full).ToLower(); $ct = $mime[$ext]; if (-not $ct) { $ct = 'application/octet-stream' }
      Send $ctx 200 ([IO.File]::ReadAllBytes($full)) $ct ($ext -eq '.html')
    } catch {
      Log "erro: $($_.Exception.Message)"
      try { SendText $ctx 500 'error' } catch { }
    }
  }
} finally {
  try { $listener.Stop() } catch { }
  Remove-Item (Join-Path $data 'server.pid') -Force -ErrorAction SilentlyContinue
  Log '--- fim'
}
