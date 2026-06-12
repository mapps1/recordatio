@echo off
cd /d "c:\Users\asut2\OneDrive\Pictures\Screenshots\recordatio"
"C:\Program Files\Git\bin\git.exe" config --global credential.helper wincred
"C:\Program Files\Git\bin\git.exe" push -u origin master
pause
