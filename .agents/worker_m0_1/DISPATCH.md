## 2026-09-14T04:28:41Z
You are the Foundation & Scaffolding Worker for PulseOS Milestone M0.
Your working directory is: /Users/admin/Projects/honda_leda/.agents/worker_m0_1

MANDATORY FIRST STEP: Read /Users/admin/Projects/honda_leda/.agents/ORIGINAL_REQUEST.md and /Users/admin/Projects/honda_leda/.agents/teamwork_preview_orchestrator_1/PROJECT.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

REFERENCE BLUEPRINTS (READ THESE CAREFULLY):
1. Backend Plan: /Users/admin/Projects/honda_leda/.agents/explorer_m0_1/backend_scaffold_plan.md
2. Persistence & Seeder Plan: /Users/admin/Projects/honda_leda/.agents/explorer_m0_2/persistence_seeder_plan.md
3. Frontend Plan & View Skeletons: /Users/admin/Projects/honda_leda/.agents/explorer_m0_3/frontend_scaffold_plan.md and /Users/admin/Projects/honda_leda/.agents/explorer_m0_3/view_templates.md

FILE EXCLUSIVE OWNERSHIP:
You own /Users/admin/Projects/honda_leda/backend/** and /Users/admin/Projects/honda_leda/frontend/**.

YOUR TASKS:
1. Backend Scaffolding (/Users/admin/Projects/honda_leda/backend):
   - Scaffold Spring Boot 3.2.12 project with Java 17.
   - Create pom.xml, .mvn/wrapper/maven-wrapper.properties, and executable mvnw / mvnw.cmd.
   - Configure application.yml with dual profiles: default `demo` (embedded H2 with live /h2-console at http://localhost:8080/h2-console, web-allow-others: true) and `mysql`.
   - Implement schema.sql containing all 27 tables from persistence_seeder_plan.md (Section 2).
   - Implement the complete JPA entity hierarchy in com.pulseos.entity using Table-Per-Type (InheritanceType.JOINED):
     Person, Patient, Employee, Doctor, Receptionist, Pharmacist, LabTechnician, SystemAdmin, Department, Ward, Supplier, PurchaseOrder, Appointment, Drug, Prescription, PrescriptionItem, LabTest, Invoice, PaymentTransaction, and associated junction entities/enums.
   - Implement all 23 Spring Data JPA repositories in com.pulseos.repository.
   - Implement DataSeeder.java (CommandLineRunner) idempotently seeding the 6 authentic SLIIT staff members (Doctor Kavinda, Receptionist Dila, Pharmacist Harshika, Lab Tech Nethuli, Cashier/Admin Kesaru, Receptionist Chanul), 12 realistic patients across triage priorities, 23 drugs with low-stock alerts, appointments, prescriptions, lab tests, and itemized invoices.
   - Implement SecurityConfig.java (CORS for localhost:5173, CSRF disabled for APIs and H2, frameOptions sameOrigin).
   - Implement PayHereConfig.java, PayHereSecurityUtil.java, HealthCheckController.java, and PulseOsApplication.java.
   - Run `./mvnw clean test` in backend/ and verify that the build succeeds and all tests pass cleanly.

2. Frontend Scaffolding (/Users/admin/Projects/honda_leda/frontend):
   - Create package.json with React 19, React-DOM 19, Lucide React, Tailwind CSS v3, PostCSS, Autoprefixer, Axios.
   - Create vite.config.ts (port 5173, proxy /api and /h2-console to http://localhost:8080).
   - Create tailwind.config.js, postcss.config.js, tsconfig.json, tsconfig.node.json, index.html.
   - Create src/index.css with Apple HIG design tokens, Plus Jakarta Sans, JetBrains Mono, active:scale-[0.98] tactile feedback, 1px border refractions, custom scrollbar.
   - Create src/types/index.ts, src/services/api.ts, src/context/RoleContext.tsx.
   - Create components: Navbar.tsx (with PulseOS brand, system clock, H2 Live Console link, active user pill), Sidebar.tsx (with role switcher and module navigation), Toast.tsx.
   - Create module view components: PatientView.tsx, DoctorView.tsx, AppointmentView.tsx, PharmacyView.tsx, BillingView.tsx, LaboratoryView.tsx.
   - Run `npm install` and `npm run build` in frontend/ to verify zero compile or bundling errors.

3. Verification:
   - Run `./mvnw clean test` in `backend/` and record the output in your handoff.
   - Run `npm run build` in `frontend/` and record the output in your handoff.

4. Deliver your handoff report to /Users/admin/Projects/honda_leda/.agents/worker_m0_1/handoff.md and notify the orchestrator (0537ee14-af04-4d70-a110-0cd7cc3b089f).
