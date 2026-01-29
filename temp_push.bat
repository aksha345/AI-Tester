@echo off
set "GIT_PATH=C:\Program Files\Git\cmd\git.exe"
"%GIT_PATH%" init
"%GIT_PATH%" remote add origin https://github.com/aksha345/AI-Tester.git
"%GIT_PATH%" add .
"%GIT_PATH%" commit -m "Initial commit: Local LLM Testcase Generator"
"%GIT_PATH%" branch -M main
"%GIT_PATH%" push -u origin main
