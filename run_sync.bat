@echo off
robocopy "C:\Users\sean\Documents\Necronomicon Reborn\04_knowledge_wikis\bias_ccr_wiki\wiki" "C:\Users\sean\Documents\github\quartz-publish\content" /MIR /FFT /Z /W:5 /R:3
cd /d "C:\Users\sean\Documents\github\quartz-publish"
call npx quartz sync
