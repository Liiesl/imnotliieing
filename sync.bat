@echo off
cd C:\Users\goblo\Downloads\imnotliieing web
git pull origin main
git add .
git commit -m "Auto-sync: %date% %time%"
git push origin main
main.py