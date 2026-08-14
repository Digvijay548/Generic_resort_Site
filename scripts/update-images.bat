@echo off
REM ===========================================================
REM  Double-click this file after adding or removing photos in
REM  assets\images\. It rebuilds the website's image list.
REM ===========================================================
setlocal
cd /d "%~dp0.."

echo Updating website images...
echo.

python scripts\generate-images.py %*
if errorlevel 1 goto failed

echo.
echo Done. Refresh the website in your browser to see the changes.
echo.
pause
exit /b 0

:failed
echo.
echo Something went wrong. Check the messages above.
echo If Python is missing, install it from https://www.python.org/downloads/
echo.
pause
exit /b 1
