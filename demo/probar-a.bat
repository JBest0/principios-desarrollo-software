@echo off
cd /d "%~dp0"
if exist out rmdir /s /q out
javac -encoding UTF-8 -d out comun\*.java versionA\*.java || goto :fin
java -cp out versionA.Pruebas
:fin
pause
