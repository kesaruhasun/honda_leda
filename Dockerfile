# =============================================================================
# PulseOS — Multi-Stage Production Dockerfile for Render.com
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build React + Vite Frontend
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit

COPY frontend/ ./
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Build Spring Boot Backend & Embed Frontend Assets
# -----------------------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-17-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

COPY backend/src ./src

# Embed compiled frontend assets directly into Spring Boot's static folder
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static

RUN mvn clean package -DskipTests -B

# -----------------------------------------------------------------------------
# Stage 3: Lightweight Production JRE Runtime
# -----------------------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine AS runner
WORKDIR /app

# Run as non-root user for container security
RUN addgroup -S pulseos && adduser -S pulseos -G pulseos

COPY --from=backend-builder --chown=pulseos:pulseos /app/backend/target/pulseos-0.0.1-SNAPSHOT.jar /app/app.jar

USER pulseos

ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=demo \
    JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT:-8080} -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-demo} -jar /app/app.jar"]
