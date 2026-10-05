# Original User Request

## 2026-10-04T06:02:07Z

# Teamwork Project Prompt — Draft

Re-architect and implement an advanced Hospital Management System, solving all existing architectural, security, and UI flaws. The system uses a Java Spring Boot backend and React frontend. 

Working directory: /Users/admin/Projects/honda_leda
Integrity mode: benchmark

## Requirements

### R1. Complete UI Overhaul (Clean Slate)
Wipe the existing generic Tailwind frontend and implement a cohesive, professional "clean slate" UI. You MUST use the `tailadmin-ui`, `ui-ux-pro-max`, and `emil-design-eng` skills to ensure a strict typography scale, proper whitespace, and high-end micro-interactions. Implement distinct role-based dashboards (Doctor, Patient, Pharmacist, Manager). 

### R2. Fix Architecture & Security Flaws (Full Stack Audit Resolution)
- **Backend Domain Modeling:** Refactor the chaotic, duplicated DTOs (e.g., `PatientDTOs`) into a strict single-source-of-truth domain model. Use Domain-Driven Design (DDD) to separate packages cleanly (e.g., `com.pulseos.patient`). Use the `domain-modeling` and `mysql` skills.
- **Secure RBAC:** Remove the insecure client-side "Station Switcher" dropdown. Implement real backend-enforced Role-Based Access Control using JWT claims.
- **Dynamic Landing Page:** The landing page must fetch real data from the backend, not hardcoded arrays.

### R3. Advanced Appointment Calendar
Implement a high-quality, intuitive appointment booking calendar that provides distinct, easy-to-read views for Patients, Doctors, and Managers.

### R4. Integrations (Payments & Email)
- **Payments:** Integrate the PayHere payment gateway structure. Build the backend logic, mock the flow for now, and prepare it for live credentials to be added later.
- **Notifications:** Integrate an email notification service for critical events (appointment confirmations, payment receipts).

### R5. File Organization
Use the `file-organizer` skill to restructure and manage the project's file and folder architecture intelligently, ensuring a clean, logical structure across the entire codebase.

## Acceptance Criteria

### UI & Architecture
- [ ] Frontend uses a cohesive component system without generic `.apple-btn` slop.
- [ ] Backend DTOs have zero redundant fields (e.g., no overlapping `dob` and `dateOfBirth`).
- [ ] Backend directory structure follows strict Domain-Driven Design principles.

### Security
- [ ] Attempting to access a restricted role dashboard without the proper backend-signed JWT token fails securely.

### Calendar & Integrations
- [ ] Calendar renders correctly and differently based on the logged-in role's permissions.
- [ ] A mock PayHere transaction completes successfully and updates the database.
- [ ] Booking an appointment triggers an email notification pipeline.
