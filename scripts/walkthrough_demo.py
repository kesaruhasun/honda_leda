import time
import os

OUT_DIR = "/Users/admin/Projects/honda_leda/demo_screenshots"
os.makedirs(OUT_DIR, exist_ok=True)

def step(title):
    print(f"\n==========================================")
    print(f"STEP: {title}")
    print(f"==========================================")

def snap(filename):
    path = os.path.join(OUT_DIR, filename)
    time.sleep(1.5)
    capture_screenshot(path)
    print(f"--> Saved screenshot: {filename}")

# Ensure real foreground tab
ensure_real_tab()
activate_tab(current_tab())

# -----------------------------------------------------------------
# 1. LANDING PAGE
# -----------------------------------------------------------------
step("Landing Page Hero")
goto_url("https://pulseos.tekkeys.com/")
wait_for_load()
time.sleep(2)
snap("01_landing_hero.png")

step("Landing Page Features & Architecture")
js("(() => { window.scrollTo({top: 800, behavior: 'instant'}); })()")
time.sleep(1.5)
snap("02_landing_features.png")

# -----------------------------------------------------------------
# 2. PATIENT FLOW
# -----------------------------------------------------------------
step("Patient Login Screen")
goto_url("https://pulseos.tekkeys.com/login/patient")
wait_for_load()
time.sleep(2)
snap("03_patient_login.png")

step("Login as Demo Patient")
js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const demoBtn = btns.find(b => b.textContent && b.textContent.includes('Demo Patient'));
  if (demoBtn) demoBtn.click();
})()''')
time.sleep(1)

js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const submitBtn = btns.find(b => b.textContent && b.textContent.includes('Sign in'));
  if (submitBtn) submitBtn.click();
})()''')
time.sleep(3)
wait_for_load()
snap("04_patient_appointments.png")

step("Patient Prescriptions Tab")
js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const rxTab = btns.find(b => b.textContent && b.textContent.includes('Prescriptions'));
  if (rxTab) rxTab.click();
})()''')
time.sleep(2)
snap("05_patient_prescriptions.png")

step("Patient Pharmacy Store Tab")
js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const storeTab = btns.find(b => b.textContent && b.textContent.includes('Online Pharmacy'));
  if (storeTab) storeTab.click();
})()''')
time.sleep(2)
snap("06_patient_pharmacy_store.png")

step("Patient Lab Reports Tab")
js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const labTab = btns.find(b => b.textContent && b.textContent.includes('Lab Tests & Reports'));
  if (labTab) labTab.click();
})()''')
time.sleep(2)
snap("07_patient_lab_reports.png")

step("Patient Billing & Settlements Tab")
js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const billTab = btns.find(b => b.textContent && b.textContent.includes('Billing & Receipts'));
  if (billTab) billTab.click();
})()''')
time.sleep(2)
snap("08_patient_billing.png")

# -----------------------------------------------------------------
# 3. STAFF / ADMIN (MANAGER) FLOW
# -----------------------------------------------------------------
step("Staff Login Screen")
goto_url("https://pulseos.tekkeys.com/login/staff")
wait_for_load()
time.sleep(2)
snap("09_staff_login.png")

step("Login as Admin / Hospital Manager")
js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const adminBtn = btns.find(b => b.textContent && b.textContent.trim() === 'Admin');
  if (adminBtn) adminBtn.click();
})()''')
time.sleep(1)

js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const loginBtn = btns.find(b => b.textContent && b.textContent.includes('Secure Login'));
  if (loginBtn) loginBtn.click();
})()''')
time.sleep(3)
wait_for_load()
snap("10_admin_manager_dashboard.png")

step("Admin Financial & Occupancy Overview")
js("(() => { window.scrollTo({top: 600, behavior: 'instant'}); })()")
time.sleep(1.5)
snap("11_admin_financial_analytics.png")

# -----------------------------------------------------------------
# 4. DOCTOR FLOW
# -----------------------------------------------------------------
step("Login as Doctor")
goto_url("https://pulseos.tekkeys.com/login/staff")
wait_for_load()
time.sleep(2)

js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const docBtn = btns.find(b => b.textContent && b.textContent.trim() === 'Doctor');
  if (docBtn) docBtn.click();
})()''')
time.sleep(1)

js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const loginBtn = btns.find(b => b.textContent && b.textContent.includes('Secure Login'));
  if (loginBtn) loginBtn.click();
})()''')
time.sleep(3)
wait_for_load()
snap("12_doctor_opd_dashboard.png")

# -----------------------------------------------------------------
# 5. PHARMACY INVENTORY FLOW
# -----------------------------------------------------------------
step("Login as Pharmacist")
goto_url("https://pulseos.tekkeys.com/login/staff")
wait_for_load()
time.sleep(2)

js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const pharmBtn = btns.find(b => b.textContent && b.textContent.trim() === 'Pharmacist');
  if (pharmBtn) pharmBtn.click();
})()''')
time.sleep(1)

js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const loginBtn = btns.find(b => b.textContent && b.textContent.includes('Secure Login'));
  if (loginBtn) loginBtn.click();
})()''')
time.sleep(3)
wait_for_load()
snap("13_pharmacy_inventory_dashboard.png")

# -----------------------------------------------------------------
# 6. LABORATORY DIAGNOSTICS FLOW
# -----------------------------------------------------------------
step("Login as Lab Technician")
goto_url("https://pulseos.tekkeys.com/login/staff")
wait_for_load()
time.sleep(2)

js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const labBtn = btns.find(b => b.textContent && b.textContent.trim() === 'Lab Tech');
  if (labBtn) labBtn.click();
})()''')
time.sleep(1)

js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const loginBtn = btns.find(b => b.textContent && b.textContent.includes('Secure Login'));
  if (loginBtn) loginBtn.click();
})()''')
time.sleep(3)
wait_for_load()
snap("14_laboratory_diagnostics_dashboard.png")

# -----------------------------------------------------------------
# 7. RECEPTIONIST / PATIENT MANAGEMENT FLOW
# -----------------------------------------------------------------
step("Login as Receptionist")
goto_url("https://pulseos.tekkeys.com/login/staff")
wait_for_load()
time.sleep(2)

js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const recBtn = btns.find(b => b.textContent && b.textContent.trim() === 'Receptionist');
  if (recBtn) recBtn.click();
})()''')
time.sleep(1)

js('''(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const loginBtn = btns.find(b => b.textContent && b.textContent.includes('Secure Login'));
  if (loginBtn) loginBtn.click();
})()''')
time.sleep(3)
wait_for_load()
snap("15_patient_management_dashboard.png")

# -----------------------------------------------------------------
# 8. FINISH & STOP RECORDING
# -----------------------------------------------------------------
step("Stopping recording and finalizing demo assets")
try:
    stop_recording()
    print("Screen recording successfully captured and stopped.")
except Exception as e:
    print("Recording stop note:", e)

print("\nAll demo screenshots and recording steps successfully completed!")
