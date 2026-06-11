@echo off
cd /d "c:\Users\asut2\OneDrive\Pictures\Screenshots\recordatio"
"C:\Program Files\Git\bin\git.exe" init
"C:\Program Files\Git\bin\git.exe" config user.email "recordatio@app.local"
"C:\Program Files\Git\bin\git.exe" config user.name "Recordatio Dev"
"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "Add AI wellness reflections, check-in deletion with undo, improved UI matching screenshot style"
"C:\Program Files\Git\bin\git.exe" remote add origin git@github.com:mapps1/recordatio.git
"C:\Program Files\Git\bin\git.exe" push -u origin main
