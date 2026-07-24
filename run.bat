@echo off
echo ==============================================================
echo       Smart Interview Coach Platform Quickstart
echo ==============================================================

REM Attempt to add standard user-scoped winget OpenJDK path to PATH in case the shell hasn't refreshed
REM Dynamically locate extracted JDK bin folder and add to PATH
for /d %%i in ("%~dp0jdk\*") do set "PATH=%PATH%;%%i\bin"
REM Dynamically locate extracted Maven bin folder and add to PATH
set "PATH=%PATH%;%~dp0apache-maven-3.9.6\bin"

java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] java.exe was not found in your path.
    echo Please ensure Java 17+ is installed and configured in your path variables.
) else (
    echo [INFO] Java verified successfully.
)

call mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] mvn was not found in your path.
) else (
    echo [INFO] Maven verified successfully.
)

rem --- Docker compose disabled for simplicity ---
rem The platform will run in local mock mode (H2, in-memory cache, local filesystem).
echo [INFO] Docker services skipped; running in mock mode.

echo.
echo Installing frontend packages...
cd frontend
call npm install
cd ..

echo.
echo Launching Spring Boot Backend...
cd backend
start "Interview Coach Backend" cmd /c "mvn spring-boot:run"
cd ..

echo.
echo Launching Vite React Frontend...
cd frontend
start "Interview Coach Frontend" cmd /c "npm run dev -- --open"
cd ..

echo.
echo ==============================================================
echo   Services are starting up...
echo   Frontend will launch at: http://localhost:3000
echo ==============================================================
echo.
pause
