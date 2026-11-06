#!/bin/sh
cd "$(dirname "$0")" && rm -rf out && javac -encoding UTF-8 -d out comun/*.java versionA/*.java && java -cp out versionA.Main
