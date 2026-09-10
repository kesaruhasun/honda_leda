# ADR 0001: Architecture & Technology Choices for PulseOS Evaluation

## Status
Accepted

## Context
PulseOS is a web-based Hospital Management System developed for SLIIT SE2030 (Batch 02, Group 60). The system must be demonstrated live in a 15-minute evaluation slot with 5-minute Q&A, proving 75%+ completion across all 6 student modules with live database updates, strict validation, zero AI-slop UI, and equal GitHub commit attribution.

## Decisions

### 1. Database Architecture: Hybrid MySQL + H2 Console
- **Primary Engine**: MySQL with automated schema generation matching the official `PulseOS_EER_Diagram.drawio` (from IT2140 DDD Group 01).
- **Fallback & Live Inspection**: Embedded H2 console / SQLite fallback activated automatically if no live MySQL daemon is reachable. Provides a 1-click browser-based database inspector at `http://localhost:8080/h2-console` so evaluators can visually verify real-time table queries (`SELECT * FROM patients`, `SELECT * FROM invoices`) during the 15-minute live demo.

### 2. Frontend Design: Apple Design + Warm Humanist Clinical
- **Tokens & Materiality**: Grounded in `apple-design` and `web-design-engineer` (`headspace-meditation` warm humanist clinical):
  - Calming clinical teal `#0D9488`, slate background `#F8FAFC`, deep legible ink `#0F172A`, urgency coral `#F43F5E`.
  - Apple HIG standards: 1px border refractions, tactile `:active` scale (`scale(0.98)`), optical font sizing (`Plus Jakarta Sans` + `JetBrains Mono`), and zero generic AI purple gradient slop.
  - Layout: TailAdmin-inspired clinical dashboard with collapsible role-based sidebar (Doctor, Receptionist, Pharmacist, Lab Tech, Cashier/Admin).

### 3. Payment Gateway: Live PayHere Sandbox
- Module 5 (Kesaru) integrates live PayHere Sandbox (`sandbox.payhere.lk`).
- Generates itemized invoices linking Doctor fees, Pharmacy medication, and Lab test orders.
- Triggers PayHere JavaScript SDK popup accepting test sandbox card numbers (`4111 1111 1111 1111`), with webhook handler transitioning invoice state from `PENDING` -> `PAID` and generating printable receipts.

### 4. Build Execution: Teamwork Preview
- Deploy autonomous multi-agent SWE team to build backend, frontend, modules, and Git attribution in parallel, validated by an independent Victory Auditor against the 50-mark rubric.
