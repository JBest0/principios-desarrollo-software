@echo off
cd /d "%~dp0"
if exist out rmdir /s /q out
javac -encoding UTF-8 -d out comun\*.java versionB\*.java || goto :fin
java -cp out versionB.Pruebas
:fin
pause
