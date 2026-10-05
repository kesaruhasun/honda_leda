# Antigravity Skills Reference & Prompting Guide for PulseOS

This document catalogs all the key Antigravity skills configured in your environment, with prompt triggers, when to invoke them, and sample prompts tailored to the **PulseOS Hospital Management System** project.

---

## 🎨 Frontend & Design Engineering Skills

### 1. `emil-design-eng`
- **Location:** `.agents/skills/emil-design-eng/SKILL.md`
- **Purpose:** Implements Emil Kowalski's craft philosophy on UI polish, micro-interactions, responsive touch states, and animation curves.
- **When to use:** When refining button interactions, transitions, active press effects, tactile UI feedback, and eliminating sluggish or unnecessary animations.
- **Example Prompt:**
  ```text
  Please review the Doctor Consultation Queue UI using the `emil-design-eng` skill. Ensure all button press states feel tactile (active scale 0.98), transitions use ease-out curves, and all unnecessary transitions are removed.
  ```

### 2. `tailadmin-ui`
- **Location:** `~/.gemini/config/skills/tailadmin-ui/SKILL.md`
- **Purpose:** Structure guidelines and Tailwind CSS components for clean dashboard layouts (Sidebar, Sticky Header, Metric Cards, Main Content Area).
- **When to use:** When building or restructuring administrative, clinical, or patient dashboards.
- **Example Prompt:**
  ```text
  Use the `tailadmin-ui` skill to create the new Manager Oversight Dashboard layout, including a slate-900 navigation sidebar, sticky white header, and 4 KPI metric cards.
  ```

### 3. `ui-ux-pro-max`
- **Location:** `~/.gemini/config/skills/ui-ux-pro-max/SKILL.md`
- **Purpose:** Comprehensive design intelligence, typography scales, accessibility contrasts, color harmonies, and conversion-focused UI design.
- **When to use:** When designing landing pages, color palettes, and accessible clinical interfaces.

---

## 🗄️ Backend, Database & Domain Modeling Skills

### 4. `domain-modeling`
- **Location:** `~/.gemini/config/plugins/mattpocock-skills/skills/domain-modeling/SKILL.md`
- **Purpose:** Domain-Driven Design (DDD) principles, bounded contexts, aggregate roots, and single-source-of-truth DTO architectures.
- **When to use:** When designing new clinical entities, separating package boundaries (e.g. `patient`, `doctor`, `billing`), or eliminating duplicate DTO fields.
- **Example Prompt:**
  ```text
  Use the `domain-modeling` skill to review the Inpatient Ward Admission bounded context and verify there are no cyclical dependencies between patient and billing.
  ```

### 5. `mysql`
- **Location:** `.agents/skills/mysql/SKILL.md`
- **Purpose:** MySQL and InnoDB schema design, indexing strategies, foreign key constraints, query tuning, and migration scripts.
- **When to use:** When editing `schema.sql`, optimizing complex join queries, or planning production database migrations.
- **Example Prompt:**
  ```text
  Use the `mysql` skill to review our doctor schedule and appointment tables, recommending optimal composite indexes for doctor availability queries.
  ```

---

## 📁 Project Architecture & Clean Code Skills

### 6. `file-organizer`
- **Location:** `~/.gemini/config/skills/file-organizer/SKILL.md`
- **Purpose:** Cleans and reorganizes file hierarchies, eliminates dead code/backups, archives legacy scripts, and ensures maintainable folder structures.
- **When to use:** When the repository has cluttered root files, duplicated backups, or disorganized modules.

### 7. `plan-writing`
- **Location:** `~/.gemini/config/skills/plan-writing/SKILL.md`
- **Purpose:** Formulates structured, step-by-step implementation plans with explicit verification criteria and dependency tracking.
- **When to use:** Before starting any multi-step feature or architectural overhaul.

### 8. `verification-before-completion`
- **Location:** `~/.gemini/config/plugins/superpowers/skills/verification-before-completion/SKILL.md`
- **Purpose:** Enforces mandatory execution of test suites (`./mvnw test`, E2E test scripts, `npm run build`) before declaring any task finished.
- **Rule:** Never assert that code is working without terminal proof.

---

## 🚀 Quick Reference: Recommended Master Prompt

When asking for future features or fixes on PulseOS, you can use this template:

```text
Please implement [feature description] for PulseOS:
- Use the `domain-modeling` and `mysql` skills for backend JPA entities and repository queries.
- Use `tailadmin-ui` and `emil-design-eng` for the frontend React/Tailwind interface.
- Follow `verification-before-completion` by running ./mvnw test and npm run build to ensure 100% build success.
```
