@echo off
rem Recompila o FluentPath.exe (usa o compilador que ja vem no Windows).
cd /d "%~dp0.."
"%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /nologo /target:winexe /optimize /out:FluentPath.exe /win32icon:assets\fluentpath.ico /reference:System.Windows.Forms.dll tools\launcher.cs
