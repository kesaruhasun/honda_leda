# PulseOS — Viva Technical Defense & Module Source Code Dossier
## SLIIT SE2030 Software Engineering Project — Batch 02 | Group 60
### Academic Year 2026 | Year 2 Semester 1

---

### Student Information:
- **Full Name**: `Udumullage S. H. U.`
- **Preferred Name**: `Harshika`
- **Student ID (IT Number)**: `IT25100826`
- **Official SLIIT Email**: `it25100826@my.sliit.lk`
- **Assigned Major Function**: **M4: Pharmacy Inventory, Prescription Dispensing & Atomic Stock Deduction**
- **Dedicated Git Branch**: `feature/pharmacy-inventory`
- **Production URL**: `https://pulseos.tekkeys.com`
- **Database Web Interface (Adminer)**: `https://pulseos.tekkeys.com/adminer`

---

## 1. Assigned Design Pattern: Observer Pattern (Low Stock Threshold Alerts & Prescription State Change Event Bus)

### Why This Pattern Was Chosen & How It Works:
We applied the **Observer Pattern** in the pharmacy stock monitoring engine. When medications are dispensed, the inventory subject notifies observer components whenever `stockQuantity <= reorderLevel`. This triggers real-time visual low-stock warning banners on the pharmacist dashboard and dispatches purchase order replenishment alerts.

> **Viva Tip**: When the lecturer asks: *"What design pattern did you use in your individual module?"*  
> Confidently answer: *"In my module (Pharmacy Inventory, Prescription Dispensing & Atomic Stock Deduction), I implemented the **Observer Pattern**. Let me show you exactly where in my code it is located..."*

---

## 2. Complete CRUD Implementation Map

Every team member is evaluated on having complete **CRUD (Create, Read, Update, Delete)** functionality in both the **Backend (Java Spring Boot)** and **Frontend (React TypeScript)**, connected to a live database.

| Operation | Action Description | Backend Location (Controller & Service) | Frontend UI Component | Database SQL Executed |
| :--- | :--- | :--- | :--- | :--- |
| **CREATE** | Add new drug formulation to pharmacy vault with batch number, unit price, and reorder threshold | `PharmacyController.java -> @PostMapping("/drugs") addDrug() | PharmacyService.java -> addDrug()` | `PharmacyView.tsx -> handleAddDrug() & 'Add Medication' Modal` | `INSERT INTO drug (brand_name, generic_name, stock_quantity, unit_price, reorder_level) VALUES (...)` |
| **READ** | Browse drug formulary, check stock quantities, filter by low stock and search by generic name | `PharmacyController.java -> @GetMapping("/drugs") getAllDrugs() & @GetMapping("/drugs/low-stock")` | `PharmacyView.tsx -> Drug Inventory DataTable with Low Stock filter tab` | `SELECT * FROM drug WHERE stock_quantity <= reorder_level` |
| **UPDATE** | Update stock level, adjust unit pricing, or execute atomic dispensation deducting stock | `PharmacyController.java -> @PutMapping("/drugs/{id}") updateDrug() & @PostMapping("/prescriptions/{id}/dispense") dispensePrescription()` | `PharmacyView.tsx -> Edit Drug Modal & 'Dispense Prescription' button` | `UPDATE drug SET stock_quantity = stock_quantity - ? WHERE id = ?` |
| **DELETE** | Remove discontinued or expired medication batches from the active formulary | `PharmacyController.java -> @DeleteMapping("/drugs/{id}") deleteDrug() | PharmacyService.java -> deleteDrug()` | `PharmacyView.tsx -> 'Delete Drug' action button with confirmation dialog` | `DELETE FROM drug WHERE id = ?` |

---

## 3. Step-by-Step Live Viva Demonstration Script

Follow this exact sequence on your screen when demonstrating to the lecturer:
1. Open **Pharmacy Vault** (`https://pulseos.tekkeys.com/pharmacy`).
2. Demonstrate CREATE: Click **'Add Medication'**, input Brand Name (e.g. `Amoxicillin 500mg`), Generic Name (`Amoxicillin`), Stock Qty (`100`), Unit Price (`LKR 45.00`), Reorder Level (`20`).
3. Demonstrate READ: Show search filtering by generic name and click the **'Low Stock'** filter tab to highlight medications below reorder threshold.
4. Demonstrate UPDATE: Click **Edit** on a drug -> update the price or stock -> Save and show updated table row.
5. Demonstrate ATOMIC DISPENSATION: Go to Prescriptions tab -> click **'Dispense'** on an active prescription -> show the stock automatically decreasing in the inventory table!
6. Demonstrate DELETE: Click the trash icon to remove a test drug batch.
7. Open Adminer and run SQL query on `drug` and `prescription` tables to prove live database persistence.

---

## 4. Live Database Verification Query

Keep **Adminer** (`https://pulseos.tekkeys.com/adminer`) or your local MySQL client open. Run this SQL query to show the lecturer that your data is actively persisting:

```sql
-- Database: pulseos_db
SELECT id, brand_name, generic_name, stock_quantity, unit_price, reorder_level FROM drug ORDER BY id DESC LIMIT 5;
```

---

## 5. High-Probability Viva Questions & Model Answers

### Q1: How does atomic stock deduction work during prescription dispensation?
> **Answer**: Inside `@Transactional PharmacyService.dispensePrescription()`, for every medication item in the prescription, the system verifies `if (drug.getStockQuantity() < item.getQuantity()) throw new PulseException('Insufficient stock')`. If all items pass, it executes `drug.setStockQuantity(drug.getStockQuantity() - item.getQuantity())` and updates the prescription status to `DISPENSED`. Because the entire method is annotated with `@Transactional`, if any drug lacks sufficient inventory, the whole operation aborts atomically.

### Q2: How are low-stock warnings triggered?
> **Answer**: Each drug defines a `reorderLevel` threshold. When stock falls to or below this number, the query `drugRepository.findByStockQuantityLessThanEqual(reorderLevel)` retrieves the flagged records. On the frontend, this renders high-visibility amber badges and surfaces in the Low Stock tab.

### Q3: How does the pharmacy module connect with Billing?
> **Answer**: When a prescription is dispensed, each item's total cost (`quantity * unitPrice`) is computed. When Kesaru's billing module compiles the patient's hospital invoice, it queries the dispensed prescription to automatically aggregate the pharmacy medication fees into the final bill.


---

## 6. Included Source Code Files in This Folder

### Backend Java Files (`backend/`):
- `Drug.java`
- `Prescription.java`
- `PrescriptionItem.java`
- `DrugRepository.java`
- `PrescriptionRepository.java`
- `PharmacyService.java`
- `PharmacyController.java`
- `PharmacyDTOs.java`
- `Supplier.java`
- `SupplierRepository.java`

### Frontend React Files (`frontend/`):
- `PharmacyView.tsx`
- `PharmacistDashboardView.tsx`

---
*Generated for SLIIT SE2030 Group 60 Evaluation | PulseOS Hospital Management System*
