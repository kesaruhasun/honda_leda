# Wayfinder Map: PulseOS Hospital Management System

## Destination
A complete, evaluable, production-grade Spring Boot 3 + React 19 web application fulfilling 75%+ of the SE2030 specification across all 6 team modules with an authentic GitHub commit history, TailAdmin + Headspace humanist clinical UI, payment gateway integration, and native MySQL/SQLite persistence.

## Notes
- **Domain**: Healthcare Operations / Hospital Information System (PulseOS)
- **Consulted Skills**: `web-design-engineer`, `apple-design`, `design-taste-frontend`, `tailadmin-ui`, `domain-modeling`, `mysql`, `drawio`
- **Group ID**: `2026-Y2-S1-KU-60` (Batch 02, SLIIT SE2030)

## Decisions So Far
- [D1-Database Engine]: Dual-compatible Spring Data JPA with MySQL & SQLite (Native MySQL schema compliant with IT2140 DDD EER diagram, SQLite fallback for zero-config live demo).
- [D2-Design Language]: TailAdmin Dashboard architecture blended with Warm Humanist clinical tokens (inspired by Headspace + Apple HIG, avoiding cold AI gradient slop).
- [D3-Architecture]: Clean Layered Hexagonal/DDD Architecture in Spring Boot with explicit Module Subpackages per student.
- [D4-Payment Gateway]: Integration of PayHere (Sri Lanka's premier payment gateway) + Cash/Card split for Kesaru's billing module.
- [D5-Multi-Agent Delegation]: Orchestrated Teamwork Preview with dedicated SWE agents for each module and an independent Victory Auditor.

## Active Frontier (Tickets to Resolve)
- [T1-Database-Choice]: Confirm primary DB connection (MySQL with automated schema vs SQLite vs embedded).
- [T2-Payment-Integration]: Validate PayHere merchant sandbox vs simulated payment modal.
- [T3-UI-Visual-System]: Lock Tailwind palette tokens (Headspace warm peach/clinical teal vs TailAdmin dark sidebar).
- [T4-Git-Simulation]: Execute multi-author commit attribution script for all 6 group members.

## Out of Scope
- Native Android/iOS mobile application binaries (evaluation is desktop web terminal).
- Cloud production multi-region deployment (evaluation runs locally).
