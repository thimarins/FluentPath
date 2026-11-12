@echo off
rem Fluent Path - abre o app em janela propria. Nada a instalar.
rem Seu progresso fica salvo em data\progress.json (com backups diarios em data\backups).
cd /d "%~dp0"
if not exist "app\index.html" (
  echo Arquivo app\index.html nao encontrado. Rode: node build.js
  pause
  exit /b 1
)
start "" /min powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0tools\server.ps1"
exit /b 0
