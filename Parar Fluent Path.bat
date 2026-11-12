@echo off
rem Fecha o servidor local. Normalmente ele fecha sozinho cerca de 2 minutos apos voce fechar a janela do app.
cd /d "%~dp0"
if exist "data\server.pid" (
  powershell -NoProfile -Command "try { Stop-Process -Id ([int](Get-Content 'data\server.pid')) -Force; 'Servidor encerrado.' } catch { 'Servidor ja estava parado.' }"
) else (
  echo Servidor ja estava parado.
)
timeout /t 2 >nul
