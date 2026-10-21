@echo off
setlocal
rem Full output goes to a log outside the repo (anything inside it would be published).
set "LOG=%TEMP%\quartz_sync.log"
echo ==== Quartz sync %date% %time% ==== > "%LOG%"

robocopy "C:\Users\sean\Documents\Necronomicon Reborn\04_knowledge_wikis\bias_ccr_wiki\wiki" "C:\Users\sean\Documents\github\quartz-publish\content" /MIR /FFT /Z /W:5 /R:3 >> "%LOG%" 2>&1
rem robocopy exit codes 8 and above mean the copy failed.
if %ERRORLEVEL% GEQ 8 echo COPY FAILED: robocopy exit code %ERRORLEVEL%. See %LOG%

cd /d "C:\Users\sean\Documents\github\quartz-publish"
call npx quartz sync >> "%LOG%" 2>&1

rem quartz sync stops quietly if its pull or push fails; check that GitHub has every commit.
call :ahead
if not "%AHEAD%"=="0" (
  echo Push did not complete, retrying... >> "%LOG%"
  git push origin HEAD >> "%LOG%" 2>&1
  call :ahead
)
if not "%AHEAD%"=="0" (
  echo PUSH FAILED: run "git push" in quartz-publish. Log: %LOG%
) else (
  echo Sync OK: GitHub is up to date. Log: %LOG%
)

call "C:\Users\sean\Documents\github\imperial_calendar\scripts\publish-calendar.bat"
exit /b 0

:ahead
set "AHEAD=unknown"
for /f %%n in ('git rev-list --count "@{u}..HEAD" 2^>nul') do set "AHEAD=%%n"
exit /b 0
