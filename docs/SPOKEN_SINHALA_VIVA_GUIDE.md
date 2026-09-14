# PulseOS — Tomorrow's Viva & Evaluation Master Script (Spoken Sinhala / Singlish)
**SLIIT SE2030 (Batch 02 - Group 60)**
**Dress Code**: Formal (Long-sleeve Shirt + Tie / Formal Trousers + Shoes)

---

## 📢 Common Group Instructions (Kattiyatama Ekata)

Machanla, heta evaluation ekata **formal andan enna one aniwa**. Kalabala wenna kisi deyak na. Evaluator / Lecturer ta apita project eka visually pennala, **CRUD (Create, Read, Update, Delete) kohomada wenne kiyala UI ekenui, database ekenui pennanna thiyenne.**

### 1. System Eka Run Karaganne Mehemai:
Terminals 2k open karala:
- **Backend run karanna**:
  ```bash
  cd honda_leda/backend
  ./mvnw spring-boot:run
  ```
  *(Backend eka `http://localhost:8080` eke run wenawa)*
- **Frontend run karanna**:
  ```bash
  cd honda_leda/frontend
  npm run dev
  ```
  *(Browser eken `http://localhost:5173` gihin open karaganna)*

### 2. Live Database Eka (H2 Console / DBeaver) Open Karaganne Mehemai:
Lecturer ahanawa "Show me your database updates in real time" kiyala.
- Browser tab ekaka open karanna: `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:pulseos_db`
- **User Name**: `sa` | **Password**: *(hisa thiyanna / blank)*
- Click **Connect**. Dan database tables okkoma left sidebar eke penawa!

---

## 👤 Member 1: Dila (Somarathna P. G. D. S. - IT25103819)
**Module**: Patient Management (Registration, Medical Records & Demographics)

### 🎯 Uba Viva Ekedee Kiyanna One De:
> *"Sir, mama kare Patient Management module eka. System ekata aluthen ena patient kenekwa register karala, eyage medical history, allergies record karanna puluwan. Unique NIC eken patient identity eka maintain wenawa."*

### 🛠️ UI Eke Step-by-Step Pennana Hati (CRUD):
1. **CREATE**:
   - Sidebar eken **"Patients"** click karapan.
   - **"+ Register New Patient"** button eka obanna.
   - Modal eke type karanna:
     - Name: `Kamal Gunaratne`
     - NIC: `199512345678`
     - Phone: `0771234567`
     - Blood Group: `O+`
     - Allergies: `Penicillin`
   - **"Save Patient"** click karanna. Patient list ekata watenawa!
2. **READ**:
   - Search bar eke `Kamal` hari NIC eka hari type karala live filter wena hati pennanna.
   - Patient row eka click karala eyage medical profile drawer eka open karanna.
3. **UPDATE**:
   - Patient profile eke **"Edit"** click karala Phone number eka `0719998877` kiyala wenas karala Save karanna.
4. **DELETE / ARCHIVE**:
   - Patient row eke action menu eken **"Archive Patient"** click karanna. Status eka `INACTIVE` wenawa.

### 💾 H2 Console Eke Run Karanna One SQL Query Eka:
```sql
SELECT ID, FIRST_NAME, LAST_NAME, NIC, PHONE, BLOOD_GROUP, STATUS FROM PATIENT ORDER BY ID DESC;
```
*(Uba add karapu `Kamal Gunaratne` row eka live watila thiyenawa lecturer ta pennanna)*

---

## 👤 Member 2: Kavinda (Rathnayaka R. M. K. L. B. - IT25103999)
**Module**: Doctor Management (Specialty Departments, Rostering & Duty Status)

### 🎯 Uba Viva Ekedee Kiyanna One De:
> *"Sir, mama kare Doctor Management module eka. Hospital eke consultantslawa departments walata assign karala, eyalage consultation fee eka set karanna saha weekly duty schedule ekath, on-duty/off-duty live toggle ekath manage karanne meken."*

### 🛠️ UI Eke Step-by-Step Pennana Hati (CRUD):
1. **READ**:
   - Sidebar eken **"Physicians"** (Doctor Roster) click karanna.
   - Hospital eke inna doctorsla (e.g. `Dr. Nihal Senaratne - Cardiology`, `Dr. Anoma Jayawardena - Neurology`) list eka pennanna.
2. **UPDATE (Duty Status & Fee)**:
   - Doctor card ekaka thiyena **"On Duty / Off Duty"** badge eka toggle karanna. Instant eka change wenawa.
   - **"Edit Profile"** click karala Consultation Fee eka `3500.00` sita `4000.00` karala Save karanna.
3. **CREATE (Schedule Rostering)**:
   - Doctor ge **"Manage Schedule"** gihin aluth day ekakata (e.g. `Friday 14:00 - 18:00`, Max Patients: `20`) time slot ekak add karanna.
4. **DELETE**:
   - Rostered time slot ekaka thiyena Delete icon eka click karala slot eka remove karanna.

### 💾 H2 Console Eke Run Karanna One SQL Query Eka:
```sql
SELECT D.ID, P.FIRST_NAME, P.LAST_NAME, D.SPECIALIZATION, D.CONSULTATION_FEE, D.ON_DUTY 
FROM DOCTOR D 
JOIN PERSON P ON D.PERSON_ID = P.ID;
```

---

## 👤 Member 3: Chanul (Malwatta M.W.C.S - IT25101620)
**Module**: Appointment Scheduling & Double-Booking Conflict Prevention

### 🎯 Uba Viva Ekedee Kiyanna One De:
> *"Sir, mama kare Appointment Scheduling module eka. Patientslata doctorslawath date and time slot ekath thorala appointments book karanna puluwan. Methana apita strict algorithm ekak thiyenawa ekama doctor ta ekama time slot eke double-booking wenna nodi block karanna."*

### 🛠️ UI Eke Step-by-Step Pennana Hati (CRUD):
1. **CREATE**:
   - Sidebar eken **"Appointments"** click karanna.
   - **"+ Book Appointment"** obanna.
   - Patient: `Kasun Perera` (Demo Patient), Doctor: `Dr. Nihal Senaratne`, Date: Heta date eka, Time: `10:00 AM`.
   - **"Confirm Booking"** click karanna. Status eka `SCHEDULED` kiyala card ekak widiyata watenawa!
2. **READ (Calendar Grid)**:
   - Top right eke thiyena **"Calendar View"** switch eka obanna. Time grid eke full screen appointment blocks visually render wena hati pennanna.
3. **BUSINESS LOGIC PROOF (Double Booking Validation)**:
   - Ayeth **"+ Book Appointment"** gihin, **ekama doctor ta, ekama date & time slot ekata** book karanna try karanna.
   - System eken toast error ekak denawa: *"Doctor is already booked for this slot! Double booking prevented."* (Lecturersla mekata patta aasayi!).
4. **UPDATE & DELETE**:
   - Appointment card eke **"Confirm"** click karama badge eka green color `CONFIRMED` wenawa.
   - **"Cancel"** click karama status eka `CANCELLED` wenawa.

### 💾 H2 Console Eke Run Karanna One SQL Query Eka:
```sql
SELECT ID, APPOINTMENT_NUMBER, APPOINTMENT_DATE, TIME_SLOT, STATUS FROM APPOINTMENT ORDER BY ID DESC;
```

---

## 👤 Member 4: Harshika (Udumullage S.H.U. - IT25100826)
**Module**: Pharmacy Inventory & Prescription Dispensing

### 🎯 Uba Viva Ekedee Kiyanna One De:
> *"Sir, mage module eka Pharmacy & Drug Inventory. Drugs hospital ekata intake karana eka, batch expiry dates saha low-stock alerts track karanawa. Doctor liyapu prescription ekak pharmacist dispense karapu gaman inventory stock eken real-time deduct wenawa."*

### 🛠️ UI Eke Step-by-Step Pennana Hati (CRUD):
1. **READ & LOW STOCK ALERTS**:
   - Sidebar eken **"Pharmacy"** click karanna.
   - Inventory table eke thiyena drugs pennanna (e.g. `Amoxicillin 500mg`, `Paracetamol 500mg`).
   - Stock eka reorder level ekata wada adu ewa Red/Amber color warning tags walin alert wena hati pennanna.
2. **CREATE (Stock Intake)**:
   - **"+ Add Drug Stock"** click karanna.
   - Name: `Cetirizine 10mg`, Batch: `BATCH-2026-X`, Stock: `500`, Unit Price: `15.00`.
   - Save karanna. Table ekata aluth drug eka add wenawa.
3. **UPDATE / ATOMIC STOCK REDUCTION (Dispensing)**:
   - Ude doctor prescribe karapu prescription eka gawa **"Dispense Medication"** button eka obanna.
   - System eken stock eka deduct wela status eka `DISPENSED` wenawa.
4. **DELETE**:
   - Expire wechcha drug batch ekak thiyenawanam **"Archive / Discontinue"** karanna puluwan.

### 💾 H2 Console Eke Run Karanna One SQL Query Eka:
```sql
SELECT ID, BRAND_NAME, GENERIC_NAME, STOCK_QUANTITY, REORDER_LEVEL, UNIT_PRICE FROM DRUG ORDER BY ID DESC;
```

---

## 👤 Member 5: Kesaru (Dhanasinghe K. A. K. H. - IT25103992)
**Module**: Multi-Item Invoicing, Counter Settlements & PayHere Payment Gateway

### 🎯 Uba Viva Ekedee Kiyanna One De:
> *"Sir, mama kare Billing & Automated Payments module eka. Patient kenek discharge weddi hari clinic visit eken passe eyage Doctor consultation fee, Pharmacy walin gaththa medicines, Lab tests okkoma aggregate wela automated itemized invoice ekak generate wenawa. Apita counter cash payments saha Central Bank approved PayHere Live Sandbox payment gateway eka integrate karala thiyenawa."*

### 🛠️ UI Eke Step-by-Step Pennana Hati (CRUD):
1. **CREATE (Generate Invoice)**:
   - Sidebar eken **"Billing"** click karanna.
   - **"+ Create New Invoice"** click karanna.
   - Patient: `Kasun Perera` select karama doctor fee + pharmacy fee automatically line items widiyata calculate wela Total eka watenawa.
   - Save invoice!
2. **READ (Itemized Breakdown & Print)**:
   - Invoice eka click karala printable invoice modal eka open karanna. Subtotals, tax, hospital charges okkoma crystal clear penawa.
3. **UPDATE (PayHere Online Payment)**:
   - Invoice card eke **"Pay via PayHere"** click karanna.
   - Official PayHere Sandbox Payment iframe eka popup wenawa!
   - PayHere test card (Visa / Master) details gahala pay karanna.
   - Payment eka success wechcha gaman callback eken Invoice status eka `UNPAID` sita `PAID` wenawa!
4. **CASH COUNTER PAYMENT**:
   - "Pay Cash at Counter" dunnama transaction record ekak save wela receipt eka generate wenawa.

### 💾 H2 Console Eke Run Karanna One SQL Query Eka:
```sql
SELECT ID, INVOICE_NUMBER, TOTAL_AMOUNT, PAYMENT_STATUS, PAYMENT_METHOD, CREATED_AT FROM INVOICE ORDER BY ID DESC;
```

---

## 👤 Member 6: Nethuli (Thilakarathne H.S.K.P.N - IT25103363)
**Module**: Laboratory Diagnostics, Specimen Lifecycle & Certified Pathology Reports

### 🎯 Uba Viva Ekedee Kiyanna One De:
> *"Sir, mage module eka Pathology & Diagnostic Laboratory Investigations. Hospital eke laboratory assistantslata saha technologistslata dedicated station ekak thiyenawa. Eken test order karala, specimen lifecycle eka (Requested ➔ Collected ➔ Processing in Analyzer ➔ Completed) track karala, quantitative findings enter karaddi abnormal values auto-flag wenawa. Report eka certified karapu gaman patient ta SMS & Patient Portal eken update wenawa, official accredited PDF report ekath print karanna puluwan."*

### 🛠️ UI Eke Step-by-Step Pennana Hati (CRUD):
1. **LAB ASSISTANT LOGIN**:
   - Staff Login screen eke **"Lab Tech"** quick access button eka obanna (Username: `lab`, Password: `password`).
   - Ekapaaratama Laboratory Station eka open wenawa: *"N. Thilakarathne, MLT — Senior Pathology Technologist (ISO 15189 Accredited)"*.
2. **CREATE (Order Investigation)**:
   - Top right eke **"+ Order New Investigation"** click karanna.
   - Patient: `Kasun Perera` (Demo Patient), Assay: `Lipid Profile Panel` hari `Full Blood Count (FBC)`, Urgency: `STAT / URGENT`.
   - Submit karanna. Barcode ekak ekka `REQUESTED` status eken aluth row ekak add wenawa!
3. **READ & 4-STAGE SAMPLE LIFECYCLE (Sample Tracking)**:
   - **Stage 1 (Phlebotomy)**: Row eke **"📥 Collect Specimen"** click karanna ➔ Status `COLLECTED` wenawa (tube barcoded & scanned).
   - **Stage 2 (In Analyzer)**: Row eke **"🔬 Load into Analyzer"** click karanna ➔ Status `ANALYZING / PROCESSING` wenawa.
4. **UPDATE & CERTIFY RESULTS**:
   - Row eke **"🧪 Certify Results"** click karanna.
   - Result eka enter karanna: `195 mg/dL` (Ref: 100 - 199 mg/dL).
   - "Flag as abnormal" tick box eka on karala **"Certify & Release Report"** click karanna.
   - **Patient Notification Proof**: System eken alert ekak denawa: *"Patient Notification Dispatched: SMS & Patient Portal Alert sent to Kasun Perera: 'Your diagnostic report for Lipid Profile is now ready to view.'"*
5. **OFFICIAL DIAGNOSTIC REPORT (Accredited PDF View & Print)**:
   - Row eke **"📄 Official Report"** click karanna.
   - ISO 15189 Accredited PulseOS Laboratory Medical Report modal eka popup wenawa:
     - Hospital Letterhead & Barcode
     - Patient Demographics & Ordering Physician
     - Investigation Findings Table with Reference Range & Red High/Low flag
     - Dual Digital Signatures: Nethuli Thilakarathne (MLT) & Dr. Anoma Jayawardena (Consultant Pathologist).
   - **"Print Official PDF"** obala print dialog eka pennanna!
6. **PATIENT PORTAL PROOF**:
   - Patient portal eke (`/patient/login` -> Kasun Perera: `199012345678` / `password`), **"Diagnostic Lab Reports"** tab eka click karanna.
   - 4-step progress bar eka visually pennanna (`1. Order Received` ➔ `2. Specimen Collected` ➔ `3. In Analyzer` ➔ `4. Report Certified`).
   - Patient tath **"View & Download Official Diagnostic Report"** button eken me report ekama open wena hati pennanna!
7. **DELETE / CANCEL SPECIMEN**:
   - Laboratory table eke trash icon eka click karala contaminated specimen ekak cancel / archive karanna puluwan.

### 💾 H2 Console Eke Run Karanna One SQL Query Eka:
```sql
SELECT ID, REQUEST_NUMBER, TEST_CODE, TEST_NAME, STATUS, RESULT_DATA, FLAG, TECHNICIAN_NAME FROM LAB_TEST ORDER BY ID DESC;
```

---

## 💡 Pro Viva Tips (Heta Morning Ekata)
1. **Confidence is 90%**: Lecturer ahanakota nervous wenna epa. "Yes Sir, exactly" kiyala kiyala screen eke click karala pennapan.
2. **DB Update Proof**: UI eke save karapu gaman H2 Console eke tab ekata switch wela `Run (Ctrl+Enter)` gahala aluth row eka pennapan. Evaluatorsla mekata full marks denawa!
3. **Demo Patient**: NIC: `199012345678`, Name: `Kasun Perera`. Oya patient wa hama ekatama use karanna puluwan.
