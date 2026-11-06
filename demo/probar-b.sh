#!/bin/sh
cd "$(dirname "$0")" && rm -rf out && javac -encoding UTF-8 -d out comun/*.java versionB/*.java && java -cp out versionB.Pruebas
