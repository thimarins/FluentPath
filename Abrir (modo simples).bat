@echo off
rem Plano B, sem servidor: abre o arquivo direto no navegador.
rem O progresso fica so dentro do navegador (use Settings > Export my data para fazer backup).
cd /d "%~dp0"
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "" "%EDGE%" --app="file:///%~dp0app/index.html"
) else (
  start "" "%~dp0app\index.html"
)
exit /b 0
