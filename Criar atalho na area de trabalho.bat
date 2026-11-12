@echo off
rem Cria o atalho "Fluent Path" (com o icone novo) na sua area de trabalho. Nada e instalado.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$r=(Get-Location).Path; $ws=New-Object -ComObject WScript.Shell; $d=[Environment]::GetFolderPath('Desktop'); $s=$ws.CreateShortcut($d+'\Fluent Path.lnk'); $s.TargetPath=$r+'\Abrir Fluent Path.bat'; $s.WorkingDirectory=$r; $s.IconLocation=$r+'\assets\fluentpath.ico'; $s.WindowStyle=7; $s.Description='Fluent Path - tutor de ingles'; $s.Save(); 'Atalho criado na area de trabalho.'"
echo.
echo Para fixar na barra de tarefas: clique com o botao direito no atalho da area de trabalho e escolha "Fixar na barra de tarefas".
pause
