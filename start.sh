#!/bin/bash
# =============================================================================
# PulseOS — One-Click Launch Script
# =============================================================================
set -e

echo ''
echo '🏥  PulseOS — Hospital Management System'
echo '========================================='
echo '   SE2030 Group Project | KU-60'
echo ''

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
    echo ''
    echo '🛑 Shutting down PulseOS...'
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# Start backend
echo '🔧 Starting Spring Boot backend (port 8080)...'
cd "$SCRIPT_DIR/backend"
./mvnw spring-boot:run -Dspring-boot.run.profiles=demo -q &
BACKEND_PID=$!
cd "$SCRIPT_DIR"

# Wait for backend to be ready
echo '⏳ Waiting for backend to start...'
for i in $(seq 1 40); do
  if curl -s http://localhost:8080/api/v1/health > /dev/null 2>&1; then
    echo '✅ Backend is running!'
    break
  fi
  if [ "$i" -eq 40 ]; then
    echo '⚠️  Backend may still be starting. Continuing anyway...'
  fi
  sleep 2
done

# Start frontend
echo '🎨 Starting React frontend (port 5173)...'
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
cd "$SCRIPT_DIR"

echo ''
echo '🏥  PulseOS is running!'
echo ''
echo '   🌐 Frontend:    http://localhost:5173'
echo '   🔧 Backend API: http://localhost:8080/api/v1'
echo '   🗄️  H2 Console:  http://localhost:8080/h2-console'
echo '      JDBC URL: jdbc:h2:mem:pulseos_db'
echo '      Username: sa | Password: (empty)'
echo ''
echo '   Press Ctrl+C to stop all services'
echo ''

wait
