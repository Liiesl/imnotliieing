@echo off
cd https://github.com/Liiesl/imnotliieing
git pull origin main
git add .
git commit -m "Auto-sync: %date% %time%"
git push origin main
main.py