# PulseOS — Module 5: Multi-Item Invoicing, Counter Settlement & PayHere Sandbox Gateway
**Assigned Student**: Dhanasinghe K. A. K. H. (IT25103992)
**Dedicated Git Branch**: `feature/billing-payment`
**Main Project Repository**: `https://github.com/kesaruhasun/honda_leda`

---

## 1. Module Overview
This folder contains the authoritative source code files that represent your contribution to the **PulseOS Web-Based Hospital Management System (SLIIT SE2030 Group 60)**.

### Included Backend Files (Spring Boot 3.2+ Java 17):
- `Invoice.java`
- `InvoiceDrugItem.java`
- `InvoiceLabItem.java`
- `PaymentTransaction.java`
- `InvoiceRepository.java`
- `PaymentTransactionRepository.java`
- `BillingService.java`
- `BillingController.java`
- `PaymentController.java`
- `PayHereConfig.java`
- `PayHereSecurityUtil.java`
- `BillingDTOs.java`

### Included Frontend Files (React 19 + TypeScript + Tailwind CSS):
- `BillingView.tsx`

---

## 2. Git Commit Instructions (If committing from your machine)

1. Clone or open the group repository:
   ```bash
   git clone https://github.com/kesaruhasun/honda_leda.git
   cd honda_leda
   git checkout feature/billing-payment
   ```
2. Configure your student git identity:
   ```bash
   git config user.name "Dhanasinghe K. A. K. H."
   git config user.email "it25103992@my.sliit.lk"
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "feat(billing-payment): finalize Module 5: Multi-Item Invoicing, Counter Settlement & PayHere Sandbox Gateway for SE2030 evaluation"
   git push origin feature/billing-payment
   ```

---

## 3. Tomorrow's Viva Evaluation Checklist
- [ ] Understand how your Entity maps to the database table.
- [ ] Be ready to demonstrate full CRUD in the UI and show SQL updates in H2/DBeaver.
- [ ] Explain how your Service interacts with other modules.
