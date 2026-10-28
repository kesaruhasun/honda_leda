# PulseOS — Render.com Showcase Deployment & Server Migration Guide

## 1. Executive Summary

This guide details the complete deployment setup for hosting **PulseOS (Web-Based Hospital Management System)** as a live portfolio showcase on **[Render.com](https://render.com)**, and documents the successful decommissioning of PulseOS from your previous Oracle Cloud VM servers (`oracle-vm-5` and `oracle-vm-4`).

---

## 2. Target Architecture on Render.com

PulseOS is packaged as a unified multi-stage container leveraging:
- **Frontend:** React 18 + Vite SPA compiled into production static assets.
- **Backend:** Spring Boot 3.2 (Java 17) REST API running embedded Tomcat.
- **Database:** In-memory H2 database operating with `MODE=MySQL` compatibility.
- **Data Initialization:** Automated `DataSeeder` runs on container boot, pre-populating realistic demo records:
  - 21 Patients with diverse triage priorities and complete medical records.
  - 6 Doctor profiles with SLMC registration numbers and weekly schedules.
  - Outpatient appointments, prescription orders, and atomic stock deductions.
  - Multi-department itemized invoices with PayHere Sandbox integration.
  - Laboratory test catalogs and completed pathology results.
- **Resource Footprint:** Java heap tuned with `-Xms128m -Xmx384m -XX:+UseG1GC`, comfortably fitting within Render's **Free Tier (512 MB RAM)** at **$0/month**.

```mermaid
flowchart TD
    subgraph Render ["Render.com (Free Tier Cloud)"]
        subgraph Container ["Unified Docker Web Service (pulseos.onrender.com)"]
            Tomcat["Spring Boot 3 Embedded Web Server\n(Port: $PORT / 8080)"]
            Static["Embedded React SPA\n(/src/main/resources/static)"]
            H2["In-Memory Relational DB\n(MySQL Mode + DataSeeder)"]
            
            Tomcat --> Static
            Tomcat --> H2
        end
    end

    Browser["User / Portfolio Reviewer\n(Browser / Mobile)"] -->|HTTPS (TLS)| Container
```

---

## 3. How to Deploy on Render.com (2 Easy Options)

### Option A: 1-Click Blueprint Deployment (Recommended)

1. Push the local changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: configure Render showcase deployment and clean server footprint"
   git push origin main
   ```
2. Log in to [dashboard.render.com](https://dashboard.render.com/).
3. In the top navigation bar, click **New +** and select **Blueprint**.
4. Select your repository: `kesaruhasun/honda_leda`.
5. Render will automatically detect [`render.yaml`](../render.yaml).
6. Click **Apply**.
7. Render will build the multi-stage Docker container and deploy the app at `https://pulseos.onrender.com` (or your assigned sub-domain).

---

### Option B: Manual Web Service Deployment

1. On [dashboard.render.com](https://dashboard.render.com/), click **New +** and select **Web Service**.
2. Connect your GitHub repository (`kesaruhasun/honda_leda`).
3. Fill in the following details:
   - **Name:** `pulseos` (or any custom name)
   - **Region:** Any region (e.g., *Oregon (US West)* or *Frankfurt (EU)*)
   - **Branch:** `main`
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Instance Type:** `Free`
4. Expand **Environment Variables** (optional, defaults are already baked in):
   - `PORT`: `8080`
   - `SPRING_PROFILES_ACTIVE`: `demo`
   - `NOTIFICATION_MODE`: `console`
5. Click **Create Web Service**.

---

## 4. Showcase Demo Accounts

The application includes pre-configured staff and patient accounts for testing all 6 subsystems:

| Role | Username / Email | Password | Primary Showcase Features |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@pulseos.lk` | `password123` | System oversight, doctor rostering, department management, audit logs |
| **Doctor** | `doctor@pulseos.lk` | `password123` | Clinical station, patient history, prescription writing, lab test orders |
| **Receptionist** | `receptionist@pulseos.lk` | `password123` | Patient registration, emergency triage tags, appointment scheduling |
| **Pharmacist** | `pharmacist@pulseos.lk` | `password123` | Drug stock intake, batch expiry tracking, prescription dispensing |
| **Lab Technician** | `labtech@pulseos.lk` | `password123` | Pathology test order queue, sample tracking, numerical result entry |
| **Patient Portal** | `it25103819@my.sliit.lk` | `password123` | Self-service appointments, medical history, lab reports, PayHere billing |

---

## 5. Decommissioning Summary of Existing Servers

Both previous Oracle Cloud virtual machines have been cleaned up and are now freed for your other projects:

### 1. `oracle-vm-5` (`145.241.226.151` — Application Tier)
- **Status:** **Decommissioned & Available**
- `pulseos.service` was stopped, disabled, and removed from `/etc/systemd/system/`.
- Nginx reverse-proxy configuration (`/etc/nginx/sites-enabled/pulseos`) was safely removed. Nginx was reloaded.
- Deployed artifacts in `/opt/pulseos` and `/var/www/pulseos` were deleted.
- `php8.3-fpm` (installed for Adminer) was stopped and disabled.
- **Available RAM:** ~615 MB free (out of 954 MB).

### 2. `oracle-vm-4` (`145.241.238.188` — Database Tier)
- **Status:** **Database Decommissioned & Available**
- **Data Preservation:** Full SQL dump of `pulseos_db` was created and stored at [`scripts/backup_pulseos_db.sql`](../scripts/backup_pulseos_db.sql).
- `pulseos_db` and user `pulseos_user` were dropped from MySQL.
- `mysql.service` was stopped and disabled, reclaiming ~150 MB RAM.
- **Coturn / STUN Server:** Verified and remains **`active (running)`** without interruption.
