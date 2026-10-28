# PulseOS — Viva Technical Defense & Module Source Code Dossier
## SLIIT SE2030 Software Engineering Project — Batch 02 | Group 60
### Academic Year 2026 | Year 2 Semester 1

---

### Student Information:
- **Full Name**: `Dhanasinghe K. A. K. H.`
- **Preferred Name**: `Kesaru`
- **Student ID (IT Number)**: `IT25103992`
- **Official SLIIT Email**: `it25103992@my.sliit.lk`
- **Assigned Major Function**: **M5: Multi-Department Itemized Invoicing, Counter Settlement & PayHere Sandbox Gateway**
- **Dedicated Git Branch**: `feature/billing-payment`
- **Production URL**: `https://pulseos.tekkeys.com`
- **Database Web Interface (Adminer)**: `https://pulseos.tekkeys.com/adminer`

---

## 1. Assigned Design Pattern: Adapter Pattern (PayHere Sandbox 3D-Secure Payment Adapter & Counter Cash Settlement)

### Why This Pattern Was Chosen & How It Works:
We applied the **Adapter Pattern** to unify disparate payment mechanisms behind a common payment interface. The system supports both local In-Person Cashier Settlement (Cash, POS Card Terminal) and the third-party **PayHere Online Payment Gateway** (Central Bank approved 3D-Secure with MD5 cryptographic signatures and asynchronous IPN callbacks). The Adapter converts heterogeneous payment request and response payloads into a standardized `PaymentTransaction` domain entity.

> **Viva Tip**: When the lecturer asks: *"What design pattern did you use in your individual module?"*  
> Confidently answer: *"In my module (Multi-Department Itemized Invoicing, Counter Settlement & PayHere Sandbox Gateway), I implemented the **Adapter Pattern**. Let me show you exactly where in my code it is located..."*

---

## 2. Complete CRUD Implementation Map

Every team member is evaluated on having complete **CRUD (Create, Read, Update, Delete)** functionality in both the **Backend (Java Spring Boot)** and **Frontend (React TypeScript)**, connected to a live database.

| Operation | Action Description | Backend Location (Controller & Service) | Frontend UI Component | Database SQL Executed |
| :--- | :--- | :--- | :--- | :--- |
| **CREATE** | Compile aggregated multi-department invoice combining Doctor, Pharmacy, and Laboratory fees | `BillingController.java -> @PostMapping("/invoices") generateInvoice() | BillingService.java -> generateInvoice()` | `BillingView.tsx -> handleGenerateInvoice() & 'Generate Invoice' Modal` | `INSERT INTO invoice (invoice_number, total_amount, doctor_fee, pharmacy_fee, lab_fee, payment_status) VALUES (...)` |
| **READ** | Review invoices, itemized tariff breakdowns, filter by Paid/Pending, and inspect payment transactions | `BillingController.java -> @GetMapping("/invoices") getAllInvoices() & @GetMapping("/invoices/{id}")` | `BillingView.tsx -> DataTable with Paid/Pending filter & SlideOverDrawer breakdown` | `SELECT * FROM invoice ORDER BY id DESC` |
| **UPDATE** | Apply clinical concessions/discounts (Senior Citizen, Staff, Welfare) OR settle via Cashier counter / PayHere Gateway | `BillingController.java -> @PutMapping("/invoices/{id}") updateInvoice() & @PostMapping("/invoices/{id}/settle") settleInvoice()` | `BillingView.tsx -> 'Discount' button opening Apply Concession Modal & 'Cashier' settle button` | `UPDATE invoice SET discount_amount = ?, discount_reason = ?, net_amount = ? WHERE id = ?; UPDATE invoice SET payment_status = 'PAID'` |
| **DELETE** | Void / cancel incorrect invoice with audit trail preservation | `BillingController.java -> @DeleteMapping("/invoices/{id}") cancelInvoice() | BillingService.java -> cancelInvoice()` | `BillingView.tsx -> 'Void Bill' trash button opening Confirmation Modal` | `UPDATE invoice SET payment_status = 'CANCELLED' WHERE id = ?` |

---

## 3. Step-by-Step Live Viva Demonstration Script

Follow this exact sequence on your screen when demonstrating to the lecturer:
1. Open **Billing & Cashier Station** (`https://pulseos.tekkeys.com/billing`).
2. Demonstrate CREATE: Click **'Generate Invoice'**, select a patient (e.g. Kamal Perera), enter doctor fee (`LKR 2,500`), pharmacy fee (`LKR 1,850`), lab fee (`LKR 3,200`) -> Click **Generate Bill** -> Show `INV-XXXXXX` created with Total `LKR 7,550.00`.
3. Demonstrate UPDATE (Discount / Concession): On the pending invoice, click **'Discount'** -> select **'Senior Citizen (10%)'** or enter custom concession -> Show live calculation preview -> Click **'Save & Update Bill'** -> Show the table immediately reflecting adjusted Net Due!
4. Demonstrate UPDATE (Settlement): Click **'Cashier'** -> Confirm cash settlement -> Show status flipping to `PAID` with green check badge.
5. Demonstrate PayHere Gateway: Click **'PayHere'** button -> Show encrypted checkout modal with PayHere Merchant ID `1235909` -> Explain MD5 checksum generation and IPN callback verification.
6. Demonstrate DELETE (Void): Click the trash icon on a test pending invoice -> Confirm Void -> Show status updated to `CANCELLED`.
7. Open Adminer (`https://pulseos.tekkeys.com/adminer`) and run SQL query on `invoice` table to prove real-time persistence!

---

## 4. Live Database Verification Query

Keep **Adminer** (`https://pulseos.tekkeys.com/adminer`) or your local MySQL client open. Run this SQL query to show the lecturer that your data is actively persisting:

```sql
-- Database: pulseos_db
SELECT id, invoice_number, total_amount, discount_amount, net_amount, payment_status, billing_date FROM invoice ORDER BY id DESC LIMIT 5;
```

---

## 5. High-Probability Viva Questions & Model Answers

### Q1: How does your multi-item invoice aggregation work across different hospital departments?
> **Answer**: In `BillingService.generateInvoice()`, we aggregate clinical costs across three departments: (1) Attending Doctor's professional consultation fee, (2) Dispensed pharmacy medications (`sum(unitPrice * quantity)` from Harshika's module), and (3) Ordered laboratory pathology investigations (from Nethuli's module). The gross total is `doctorFee + pharmacyFee + labFee`, from which any authorized discount/concession is deducted to yield `netAmount`.

### Q2: Explain the security of your PayHere Sandbox payment integration.
> **Answer**: Our PayHere integration complies with Central Bank of Sri Lanka 3D-Secure standards. Before checkout opens, `PayHereSecurityUtil` calculates an MD5 checksum: `hash = md5(merchant_id + order_id + formatted_amount + currency + md5(merchant_secret)).toUpperCase()`. When PayHere dispatches its signed server-to-server IPN webhook to `/api/v1/payments/payhere/notify`, our backend recalculates the expected signature. Only if the signature matches 100% does the system mark the invoice as `PAID`, preventing client-side price tampering.

### Q3: Why did you implement both Cashier Counter Settlement and Online PayHere?
> **Answer**: A realistic hospital serves diverse patient demographics. Elderly or emergency outpatients frequently pay in cash or via local hospital POS card terminal at the discharge desk, while digitally savvy patients use the online Patient Portal with PayHere to settle bills remotely via Credit Card, Debit Card, or Mobile Wallets.


---

## 6. Included Source Code Files in This Folder

### Backend Java Files (`backend/`):
- `Invoice.java`
- `InvoiceDrugItem.java`
- `InvoiceLabItem.java`
- `PaymentTransaction.java`
- `PaymentMethod.java`
- `PaymentStatus.java`
- `InvoiceRepository.java`
- `PaymentRepository.java`
- `BillingService.java`
- `BillingController.java`
- `PaymentController.java`
- `PayHereConfig.java`
- `PayHereSecurityUtil.java`
- `BillingDTOs.java`

### Frontend React Files (`frontend/`):
- `BillingView.tsx`
- `PatientPortalView.tsx`

---
*Generated for SLIIT SE2030 Group 60 Evaluation | PulseOS Hospital Management System*

---

# 🎓 Kesaru Dhanasinghe (IT25103992) — Complete Viva Preparation Guide

> **Module Owner**: Module 5 — Billing, Multi-Item Invoicing & PayHere Payment Gateway  
> **Role**: Team Leader (Opening Presentation & Project Coordination)  
> **Target Audience**: Written in clear, beginner-friendly language with zero confusing jargon.

---

## 🌟 1. Your 30-Second Opening Speech as Team Leader

When the examiners say *"Who is the leader? Please introduce the project,"* take a deep breath, smile, and say:

> *"Good morning/afternoon, examiners. My name is **Kesaru Dhanasinghe** (IT25103992), and I am the leader of our group.  
> Our project is **PulseOS**, an enterprise-grade Hospital Information and Management System built with a **Java Spring Boot 3** REST API backend and a **React TypeScript** frontend, powered by **MySQL 8**.  
> The system is architected into 6 interconnected clinical modules:
> 1. Patient Registration & Triaging (Dila)
> 2. Outpatient Doctor Consultations & E-Prescriptions (Kavinda)
> 3. Appointment Scheduling (Chanul)
> 4. Pharmacy Inventory & Drug Dispensation (Harshika)
> 5. **Billing, Multi-Item Invoicing & Central Bank-compliant PayHere Gateway** (which I developed)
> 6. Pathology & Laboratory Diagnostics (Nethuli)  
> Today, we have the complete system deployed live in production on an Oracle Cloud infrastructure with real-time transactional synchronization."*

---

## 🧩 2. What is a "Design Pattern"? (Explained for Absolute Beginners)

### 💡 The Simple Analogy
Imagine you are building a house. You don't invent a new way to build doors or staircases from scratch every time. You use standard architectural blueprints that master architects have tested for hundreds of years.
In computer science:
> **A Design Pattern is a proven, reusable template or "best-practice recipe" used to solve a common software design problem.**

It is not code you copy-paste; it is an **architectural pattern** that makes your code clean, secure, easy to test, and maintainable.

---

### 🏛️ The 6 Design Patterns Used in PulseOS (Especially in Your Billing Module)

#### 1. MVC Pattern (Model - View - Controller)
* **What it is**: Separates the application into three layers so code doesn't get tangled together.
  * **View (Frontend UI)**: `BillingView.tsx` / `CashierView.tsx` — what the hospital cashier sees on screen.
  * **Controller (API Gateway)**: `BillingController.java` — receives HTTP requests from the browser (e.g. `POST /api/v1/invoices`).
  * **Service (Business Logic)**: `BillingService.java` — computes taxes, calculates discounts, checks payment status.
  * **Model / Entity (Database Structure)**: `Invoice.java` — represents the exact `invoices` table in MySQL.
* **Why we use it**: If the UI changes tomorrow, the database and business logic remain completely untouched.

#### 2. Repository Pattern (Spring Data JPA)
* **File in your module**: `InvoiceRepository.java` extending `JpaRepository<Invoice, Long>`
* **What it is**: A clean abstraction layer between Java and the database.
* **Why we use it**: Instead of writing raw JDBC connections, `Statement`, and `ResultSet` manually, Spring Data JPA handles all database queries through clean Java interfaces.

#### 3. DTO Pattern (Data Transfer Object)
* **File in your module**: `BillingDTOs.java` (`InvoiceGenerateRequest`, `InvoiceResponse`, `SettlementRequest`)
* **What it is**: Plain Java objects specifically shaped for sending data over the network via JSON.
* **Why we use it**: **Security and encapsulation.** We never expose internal database entities (`Invoice.java`) directly to the public REST API. DTOs prevent malicious payload tampering and ensure only sanitized data enters our database.

#### 4. Singleton Pattern (Spring Bean Management)
* **Where it is**: `@Service` on `BillingService`, `@RestController` on `BillingController`.
* **What it is**: Spring Boot guarantees that **only ONE instance** of `BillingService` exists in the entire computer memory during runtime.
* **Why we use it**: Saves server RAM and CPU. Instead of creating thousands of service objects for every incoming HTTP request, Spring reuses the same singleton service concurrently.

#### 5. Dependency Injection / Inversion of Control (IoC)
* **Where it is**: `@RequiredArgsConstructor` at the top of `BillingService.java`.
* **What it is**: Instead of typing `new InvoiceRepository()`, Spring automatically creates and passes the required repository instances into `BillingService` through its constructor.
* **Why we use it**: Loose coupling — makes classes easily testable with mock data.

#### 6. Strategy Pattern (Payment Processing)
* **Where it is**: `BillingService.settleInvoice()` handling `PaymentMethod.CASH` vs `PaymentMethod.CARD` vs `PaymentMethod.PAYHERE`.
* **What it is**: Different algorithms or workflows are selected dynamically based on user choice at runtime.

---

## 🗄️ 3. How Database Queries Are Created & Executed

Examiners frequently ask: *"Show me where your SQL queries are. How does Spring know how to query the MySQL database?"*

### 1. Spring Data JPA "Derived Query Methods" (Query Generation by Naming Convention)
In `InvoiceRepository.java`:
```java
Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
List<Invoice> findByPaymentStatus(PaymentStatus status);
List<Invoice> findByPatientIdOrderByBillingDateDesc(Long patientId);
```
* **How it works**: You do NOT write SQL! Spring Data JPA reads the method name:
  * `findBy` $\rightarrow$ `SELECT * FROM invoices WHERE`
  * `InvoiceNumber` $\rightarrow$ `invoice_number = ?`
* Spring generates the SQL in the background and executes it on MySQL!

### 2. Hibernate ORM (Object-Relational Mapping)
* Hibernate is the engine under the hood of Spring Data JPA.
* It maps Java classes (`@Entity class Invoice`) directly to MySQL tables (`invoices`).
* When you call `invoiceRepository.save(invoice)`:
  * If the invoice has no ID $\rightarrow$ Hibernate executes `INSERT INTO invoices (...) VALUES (...)`.
  * If the invoice already has an ID $\rightarrow$ Hibernate executes `UPDATE invoices SET ... WHERE invoice_id = ?`.

### 3. HikariCP Connection Pooling
* Located in `application-prod.yml` (`spring.datasource.hikari`).
* PulseOS keeps a pool of ready-to-use connections to the MySQL database at `10.0.0.156:3306`.
* It prevents server crashes by reusing database connections rather than opening and closing a new socket on every click.

---

## 💰 4. Kesaru's Core Billing Features Explained (How Your Code Works)

### 🏥 Feature 1: Multi-Item Invoice Aggregation (`BillingService.java` lines 59–132)
* When a patient is discharged or finishes their visit, the cashier triggers `generateInvoice()`.
* The service automatically queries three clinical departments:
  1. **Doctor Fee**: Looked up from `doctor.getConsultationFee()` (e.g. LKR 2,500.00).
  2. **Pharmacy Fee**: Iterates through all prescription items dispensed to the patient during this visit (`drug.getUnitPrice() * quantity`).
  3. **Laboratory Fee**: Iterates through all diagnostic lab tests ordered (`labTest.getStandardFee()`).
* Formula:  
  $$\text{Total Amount} = \text{Doctor Fee} + \text{Pharmacy Fee} + \text{Lab Fee}$$
  $$\text{Net Amount} = \text{Total Amount} - \text{Discount Amount}$$

---

### 🏷️ Feature 2: Concession & Discount Modal (`BillingView.tsx` & `BillingService.java`)
* Built with 6 predefined hospital concession tiers:
  1. **Senior Citizen**: 10%
  2. **Staff Privilege**: 15%
  3. **Student Concession**: 5%
  4. **Welfare Support**: 25%
  5. **Full Compassionate Waiver**: 100%
  6. **Reset / Normal Tariff**: 0%
* Cashier can also type an exact custom rupee discount (e.g. LKR 500.00).
* `PUT /api/v1/invoices/{id}` updates the `discount_amount` and recalculates `net_amount` instantly.

---

### 💳 Feature 3: Live PayHere Sandbox Payment Gateway
* Compliant with Central Bank of Sri Lanka 3D-Secure payment guidelines.
* **Pre-Payment Security Checksum (MD5 Hash)**:
  Before opening checkout, `PayHereSecurityUtil.java` calculates:
  $$\text{Hash} = \text{MD5}(\text{merchant\_id} + \text{order\_id} + \text{amount} + \text{currency} + \text{UPPERCASE}(\text{MD5}(\text{merchant\_secret})))$$
* **Why this hash exists**: Prevents hackers from tampering with the price in their browser inspect element! If someone edits LKR 5,000.00 to LKR 1.00, PayHere's servers detect the hash mismatch and reject the transaction immediately.
* **IPN Webhook (`/api/v1/payments/payhere/notify`)**:
  When payment succeeds on PayHere, their servers send an encrypted background callback (Instant Payment Notification).
  The backend verifies the signature, marks `invoice.setPaymentStatus(PaymentStatus.PAID)`, and triggers an automatic receipt email to the patient!

---

### 🧾 Feature 4: Counter Settlement & Printable Thermal Receipts
* For patients paying at the physical hospital counter:
  * Cashier selects **Cash** or **POS Card Terminal**.
  * Clicks "Confirm Counter Settlement".
  * Endpoint `POST /api/v1/invoices/{id}/settle` executes atomically in a `@Transactional` block.
  * Status updates to `PAID`, timestamp is recorded, and cashier can click "Print Receipt" to generate a clean, thermal-ready hospital invoice receipt.

---

## 🗺️ 5. Your Codebase Navigation Map (Where Your Code Lives)

Keep this open or memorized so you can point to the files instantly:

| Component | File Path | What to Highlight to Examiner |
| :--- | :--- | :--- |
| **Invoice Entity** | `backend/src/main/java/com/pulseos/billing/Invoice.java` | Show `@Entity`, `@Table(name = "invoices")`, `@ManyToOne` relationship to `Patient`. |
| **Invoice Repository** | `backend/src/main/java/com/pulseos/billing/InvoiceRepository.java` | Show `JpaRepository<Invoice, Long>` and derived methods like `findByInvoiceNumber`. |
| **Billing Service** | `backend/src/main/java/com/pulseos/billing/BillingService.java` | Point out `generateInvoice()`, `settleInvoice()`, `initiatePayHere()`, and `@Transactional`. |
| **Billing Controller** | `backend/src/main/java/com/pulseos/billing/BillingController.java` | Show `@RestController`, `@RequestMapping("/api/v1/invoices")`, `@PreAuthorize("hasAnyRole(...)")`. |
| **PayHere Security** | `backend/src/main/java/com/pulseos/billing/PayHereSecurityUtil.java` | Point out MD5 hash generation algorithm ensuring transaction integrity. |
| **Billing UI View** | `frontend/src/views/BillingView.tsx` | Show the itemized invoices list, filter badges, and Concession Modal. |
| **Cashier Terminal** | `frontend/src/views/CashierView.tsx` | Show real-time quick POS settlement and live search. |

---

## 🎯 6. Top 12 Viva Questions & Word-for-Word Answers (Cheat Sheet)

### Q1: "What was your individual contribution to PulseOS?"
> **Your Answer**:  
> *"I designed and implemented Module 5: Billing, Invoicing, and Payment Gateway integration. My module aggregates costs from Outpatient Consultations, Pharmacy drug items, and Pathology tests into unified itemized invoices. I also integrated the PayHere sandbox payment gateway with MD5 security verification, built the concession/discount engine, and developed the cashier counter settlement system."*

### Q2: "What is a Design Pattern, and which ones did you use?"
> **Your Answer**:  
> *"A design pattern is a standard, battle-tested architectural solution to common software problems. In my module, I used:  
> 1. **MVC Pattern** to separate the UI, REST Controller, Business Service, and JPA Entities.  
> 2. **Repository Pattern** via Spring Data JPA for database access.  
> 3. **DTO Pattern** to protect database models and validate API payloads.  
> 4. **Singleton Pattern** where Spring manages services as single shared instances.  
> 5. **Dependency Injection** with constructor injection for loose coupling."*

### Q3: "How does your code create database queries without writing SQL strings?"
> **Your Answer**:  
> *"We use Spring Data JPA repository interfaces. When I write a method like `findByInvoiceNumber(String invoiceNumber)` in `InvoiceRepository`, Spring parses the method name at startup and uses Hibernate ORM to automatically generate the appropriate `SELECT` query with parameterized prepared statements, preventing SQL injection."*

### Q4: "What is `@Transactional` and why is it on your service methods?"
> **Your Answer**:  
> *"The `@Transactional` annotation guarantees ACID properties — specifically Atomicity. When settling an invoice, the system must update the invoice status to `PAID`, record a payment transaction record, and trigger receipt generation. If any step fails or the database crashes midway, `@Transactional` automatically rolls back all changes so the database never ends up in a corrupted, half-settled state."*

### Q5: "How does your system calculate the final bill?"
> **Your Answer**:  
> *"In `BillingService.generateInvoice()`, the backend queries the appointment's doctor for consultation fees, sums up all dispensed prescription items (`unitPrice * quantity`), and adds any requested lab test standard fees. We then calculate subtotal, deduct any concession or discount applied, and calculate the net payable amount."*

### Q6: "Why did you use DTOs instead of passing Entity objects directly?"
> **Your Answer**:  
> *"Directly exposing JPA Entities like `Invoice` causes two big problems: first, circular reference JSON serialization loops between bidirectional relationships; second, security risks where clients could inject unauthorized fields like modifying invoice IDs or tamper with doctor fees. DTOs act as an API contract that validates and sanitizes input before it reaches our database."*

### Q7: "How does the PayHere MD5 hash security work?"
> **Your Answer**:  
> *"To prevent price tampering in the browser, the backend hashes the Merchant ID, Order ID, Formatted Amount, Currency, and the MD5 of our Secret Key into a single checksum using MD5. When PayHere opens, it independently calculates the same hash using our secret. If any character or price is modified, the hashes will not match and PayHere immediately rejects the payment."*

### Q8: "What happens when PayHere finishes a payment?"
> **Your Answer**:  
> *"PayHere sends a signed POST webhook (IPN) to `/api/v1/payments/payhere/notify`. Our backend recalculates the verification signature. Once verified, it marks the invoice as `PAID`, saves the PayHere payment reference number into our `payments` table, and calls `NotificationService` to email a payment receipt to the patient."*

### Q9: "How do you handle discounts or concessions?"
> **Your Answer**:  
> *"In `BillingView.tsx`, cashiers can open the Concession modal with 6 quick presets (such as Senior Citizen 10%, Staff 15%, Student 5%, or Full Waiver 100%) or enter a custom amount. The endpoint recalculates the net amount ensuring it never falls below zero, and saves the applied discount for audit logging."*

### Q10: "What happens if two cashiers try to settle the same invoice at the same time?"
> **Your Answer**:  
> *"Our `settleInvoice()` method is idempotent and wrapped in `@Transactional`. Before executing, it checks `if (invoice.getPaymentStatus() == PaymentStatus.PAID)`. If already settled, it immediately returns the existing settled invoice response without creating a duplicate payment transaction."*

### Q11: "Where is the system hosted?"
> **Your Answer**:  
> *"PulseOS is deployed in high-availability cloud architecture on Oracle Cloud Infrastructure:  
> - Frontend and Spring Boot Backend run on Oracle VM 5 (`145.241.226.151`) with Nginx reverse proxy and SSL certificates.  
> - The production MySQL database runs on a dedicated VM (`10.0.0.156`) in an isolated private cloud subnet for maximum data security."*

### Q12: "If you had more time, what is one improvement you would add to your module?"
> **Your Answer**:  
> *"I would implement recurring automated billing for inpatient ward stays with daily bed-charge cron calculations, and integrate direct API verification with local health insurance providers (such as Sri Lanka Insurance or Ceylinco Life) for automated cashless claims processing."*

---

## 🚀 Golden Rules for Your Viva

1. **Be Confident**: You know your module better than anyone. Speak clearly and calmly.
2. **Open the Database or DevTools**: Keep the Network tab and database viewer open to demonstrate real-time requests and responses.
3. **Praise Your Team**: Mention how your module links with Dila (Patient), Kavinda (Doctor), and Harshika (Pharmacy) — this highlights great team collaboration.
