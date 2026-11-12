// Pré-visualiza os ícones em vários tamanhos (inclui 16/32 px reais). Saída: %TEMP%\fp_icon.png
const cp = require('child_process'), os = require('os'), path = require('path'), fs = require('fs');
const A = p => 'file:///' + path.resolve(__dirname, '..', 'assets', p).split('\\').join('/');
const html = `<body style="margin:0;background:#1b1f2e;font:13px sans-serif;color:#fff;padding:20px"><div style="display:flex;gap:26px;align-items:flex-end;flex-wrap:wrap">
<div>512 (maskable)<br><img src="${A('icon-512.png')}" width=200></div>
<div>128 arredondado<br><img src="${A('favicon-128.png')}" width=128></div>
<div>48 px<br><img src="${A('favicon-128.png')}" width=48 height=48></div>
<div>32 px real<br><img src="${A('favicon-128.png')}" width=32 height=32></div>
<div>16 px real<br><img src="${A('favicon-128.png')}" width=16 height=16></div>
<div style="background:#eee;padding:12px;color:#000">fundo claro 48 px<br><img src="${A('favicon-128.png')}" width=48></div>
<div style="background:#1e2a44;padding:10px 14px;border-radius:8px">na barra de tarefas (escuro)<br><img src="${A('favicon-128.png')}" width=28 height=28 style="margin-top:6px"></div></div></body>`;
const f = path.join(os.tmpdir(), 'iconprev.html'); fs.writeFileSync(f, html);
const out = path.join(os.tmpdir(), 'fp_icon.png'); try { fs.unlinkSync(out); } catch (e) { }
cp.spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files', '--user-data-dir=' + path.join(os.tmpdir(), 'fpi_' + Date.now()), '--window-size=880,330', '--screenshot=' + out, 'file:///' + f.split('\\').join('/')], { stdio: 'ignore', detached: true }).unref();
let n = 0; const t = setInterval(() => { if (fs.existsSync(out) && fs.statSync(out).size > 2000) { clearInterval(t); console.log('ok ' + out); } else if (++n > 30) { clearInterval(t); console.log('fail'); } }, 1000);
