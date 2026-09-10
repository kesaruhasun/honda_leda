@echo off
REM =============================================================================
REM PulseOS — One-Click Launch Script (Windows)
REM =============================================================================

echo.
echo  PulseOS — Hospital Management System
echo =========================================
echo    SE2030 Group Project ^| KU-60
echo.

REM Start backend
echo  Starting Spring Boot backend (port 8080)...
cd backend
start /B mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=demo
cd ..

REM Wait for backend
echo  Waiting for backend to start...
timeout /t 20 /nobreak > nul

REM Start frontend
echo  Starting React frontend (port 5173)...
cd frontend
start /B npm run dev
cd ..

echo.
echo  PulseOS is running!
echo.
echo    Frontend:    http://localhost:5173
echo    Backend API: http://localhost:8080/api/v1
echo    H2 Console:  http://localhost:8080/h2-console
echo       JDBC URL: jdbc:h2:mem:pulseos_db
echo       Username: sa  Password: (empty)
echo.
echo    Press Ctrl+C to stop all services
echo.

pause
