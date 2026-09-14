import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  UserRound,
  Pill,
  FlaskConical,
  ShoppingBag,
  Plus,
  Search,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import { Drug } from '../types';

const FORMULARY_DRUGS: Drug[] = [
  { id: 101, itemCode: 'DRG-001', brandName: 'Panadol 500mg', genericName: 'Paracetamol', category: 'Analgesics', dosageForm: 'Tablet', strength: '500mg', unitPrice: 8.50, stockQuantity: 450, reorderLevel: 100 },
  { id: 102, itemCode: 'DRG-002', brandName: 'Augmentin 625mg', genericName: 'Amoxicillin + Clavulanic Acid', category: 'Antibiotics', dosageForm: 'Film-Coated Tablet', strength: '625mg', unitPrice: 185.00, stockQuantity: 120, reorderLevel: 30 },
  { id: 103, itemCode: 'DRG-003', brandName: 'Lipitor 20mg', genericName: 'Atorvastatin Calcium', category: 'Cardiovascular', dosageForm: 'Tablet', strength: '20mg', unitPrice: 42.00, stockQuantity: 280, reorderLevel: 50 },
  { id: 104, itemCode: 'DRG-004', brandName: 'Glucophage 500mg', genericName: 'Metformin Hydrochloride', category: 'Antidiabetics', dosageForm: 'Tablet', strength: '500mg', unitPrice: 12.00, stockQuantity: 500, reorderLevel: 100 },
  { id: 105, itemCode: 'DRG-005', brandName: 'Losec 20mg', genericName: 'Omeprazole', category: 'Gastrointestinal', dosageForm: 'Capsule', strength: '20mg', unitPrice: 28.00, stockQuantity: 340, reorderLevel: 80 },
  { id: 106, itemCode: 'DRG-006', brandName: 'Ventolin Inhaler', genericName: 'Salbutamol Sulfate', category: 'Respiratory', dosageForm: 'Inhaler', strength: '100mcg/dose', unitPrice: 1250.00, stockQuantity: 65, reorderLevel: 20 },
  { id: 107, itemCode: 'DRG-007', brandName: 'Zyrtec 10mg', genericName: 'Cetirizine Dihydrochloride', category: 'Antihistamines', dosageForm: 'Tablet', strength: '10mg', unitPrice: 35.00, stockQuantity: 200, reorderLevel: 50 },
  { id: 108, itemCode: 'DRG-008', brandName: 'Neurobion Forte', genericName: 'Vitamin B1, B6, B12', category: 'Vitamins & Supplements', dosageForm: 'Tablet', strength: 'Triple B', unitPrice: 24.00, stockQuantity: 410, reorderLevel: 75 },
];

const LAB_TESTS_FEATURED = [
  { id: 1, testCode: 'LAB-FBC', testName: 'Full Blood Count (FBC) with ESR', category: 'Hematology', price: 1500, sampleType: 'Whole Blood (EDTA)', turnaround: '4 Hours', desc: 'Comprehensive red, white cell and platelet count with infection markers.' },
  { id: 2, testCode: 'LAB-FBS', testName: 'Fasting Blood Sugar (FBS)', category: 'Biochemistry', price: 650, sampleType: 'Fluoride Plasma', turnaround: '2 Hours', desc: 'Standard diagnostic glucose determination for diabetes screening.' },
  { id: 3, testCode: 'LAB-LIP', testName: 'Lipid Profile Panel (Cholesterol/HDL/LDL)', category: 'Biochemistry', price: 2800, sampleType: 'Serum', turnaround: '6 Hours', desc: 'Full cardiovascular risk profiling including triglycerides and total ratio.' },
  { id: 4, testCode: 'LAB-KFT', testName: 'Renal Function & Serum Creatinine', category: 'Biochemistry', price: 1200, sampleType: 'Serum', turnaround: '4 Hours', desc: 'Kidney filtration evaluation, serum creatinine and calculated eGFR.' },
  { id: 5, testCode: 'LAB-LFT', testName: 'Liver Function Test (SGPT/SGOT/Bilirubin)', category: 'Biochemistry', price: 3200, sampleType: 'Serum', turnaround: '6 Hours', desc: 'Complete hepatic enzyme and protein profiling.' },
  { id: 6, testCode: 'LAB-HBA1C', testName: 'HbA1c Glycated Hemoglobin', category: 'Endocrinology', price: 2200, sampleType: 'Whole Blood', turnaround: '4 Hours', desc: '3-month average glycemic control determination.' },
  { id: 7, testCode: 'LAB-TSH', testName: 'Thyroid Stimulating Hormone (TSH Ultrasensitive)', category: 'Endocrinology', price: 2500, sampleType: 'Serum', turnaround: '12 Hours', desc: 'Screening for hypothyroidism and hyperthyroidism disorders.' },
  { id: 8, testCode: 'LAB-DENGUE', testName: 'Dengue NS1 Rapid Antigen & Antibodies', category: 'Serology', price: 2900, sampleType: 'Whole Blood', turnaround: '1 Hour', desc: 'Early acute dengue virus diagnosis with immediate medical alert.' },
];

export const LandingView: React.FC = () => {
  const navigate = useNavigate();
  const { patientSession } = useRole();
  const { showToast } = useToast();

  // Landing Page Pharmacy Store State
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [landingCart, setLandingCart] = useState<Record<number, number>>({});

  const updateCart = (drugId: number, delta: number) => {
    setLandingCart((prev) => {
      const current = prev[drugId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[drugId];
        return copy;
      }
      return { ...prev, [drugId]: next };
    });
  };

  const totalCartCount = Object.values(landingCart).reduce((a, b) => a + b, 0);
  const totalCartPrice = Object.entries(landingCart).reduce((sum, [id, qty]) => {
    const drug = FORMULARY_DRUGS.find((d) => d.id === Number(id));
    return sum + (drug ? drug.unitPrice * qty : 0);
  }, 0);

  const handlePharmacyCheckout = () => {
    if (totalCartCount === 0) {
      showToast('error', 'Cart Empty', 'Please select at least one medication to purchase.');
      return;
    }

    localStorage.setItem('pending_cart', JSON.stringify(landingCart));

    if (patientSession) {
      navigate('/patient/portal');
    } else {
      showToast('info', 'Sign In Required', 'Please log in to your patient account to confirm delivery and pay via PayHere.');
      navigate('/patient/login?redirect=pharmacy');
    }
  };

  const handleBookLabTest = (test: typeof LAB_TESTS_FEATURED[0]) => {
    localStorage.setItem('pending_lab_test', JSON.stringify(test));

    if (patientSession) {
      navigate('/patient/portal');
    } else {
      showToast('info', 'Sign In Required', 'Please sign in to schedule your diagnostic specimen collection.');
      navigate('/patient/login?redirect=lab');
    }
  };

  const categories: string[] = ['ALL', ...Array.from(new Set(FORMULARY_DRUGS.map((d) => d.category).filter((c): c is string => Boolean(c))))];

  const filteredDrugs = FORMULARY_DRUGS.filter((d) => {
    const nameMatch = d.brandName?.toLowerCase().includes(pharmacySearch.toLowerCase()) || d.genericName?.toLowerCase().includes(pharmacySearch.toLowerCase());
    const catMatch = selectedCategory === 'ALL' || d.category === selectedCategory;
    return nameMatch && catMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 apple-glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-clinical-teal-800 group">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
              <img src="/pulseos-logo.jpg" alt="PulseOS Logo" className="h-full w-full object-contain rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">PulseOS</span>
                <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
                  Hospital Core
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Healthcare Information System</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#specialties" className="hover:text-clinical-teal-700 transition-colors">Facilities</a>
            <a href="#pharmacy" className="hover:text-clinical-teal-700 transition-colors flex items-center gap-1.5">
              <Pill className="h-3.5 w-3.5 text-clinical-teal-600" />
              <span>Online Pharmacy</span>
            </a>
            <a href="#laboratory" className="hover:text-clinical-teal-700 transition-colors flex items-center gap-1.5">
              <FlaskConical className="h-3.5 w-3.5 text-clinical-teal-600" />
              <span>Diagnostic Pathology</span>
            </a>
            <Link to="/physicians" className="hover:text-clinical-teal-700 transition-colors">Our Physicians</Link>
            <Link to="/services" className="hover:text-clinical-teal-700 transition-colors">Tariffs & Services</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/patient/login"
              className="apple-btn px-4 py-2 bg-clinical-teal-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-clinical-teal-700 hover:shadow-md transition-all flex items-center gap-2"
            >
              <UserRound className="w-3.5 h-3.5" />
              <span>{patientSession ? 'Patient Portal' : 'Patient Access'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1920"
              alt="Hospital Lobby"
              className="w-full h-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 via-slate-50/70 to-slate-50"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10 pt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-clinical-teal-50 border border-clinical-teal-100 text-clinical-teal-800 text-xs font-bold tracking-wide uppercase shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Ministry of Health Certified Digital Care
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Next-generation <span className="text-clinical-teal-700">healthcare</span> & medicine delivery
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Consult verified medical specialists, order certified medications from our hospital pharmacy, and receive fast laboratory results with real-time SMS alerts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/patient/login"
                className="apple-btn w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-md hover:bg-slate-800 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Access Patient Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#pharmacy"
                className="apple-btn w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-slate-900 border border-slate-200 font-semibold text-xs shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4 text-clinical-teal-600" />
                Explore Pharmacy Store
              </a>
              <a
                href="#laboratory"
                className="apple-btn w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-slate-900 border border-slate-200 font-semibold text-xs shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <FlaskConical className="h-4 w-4 text-clinical-teal-600" />
                Diagnostic Lab Panels
              </a>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section id="specialties" className="py-14 bg-white border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Comprehensive Hospital Care
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Connected clinical modules delivering precision health outcomes across Sri Lanka.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="rounded-apple-2xl bg-slate-50 border border-slate-200/70 overflow-hidden space-y-4 hover:shadow-apple-card transition-all flex flex-col justify-between">
                <div className="h-48 w-full overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"
                    alt="Patient Consultations"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-clinical-teal-700 shadow-2xs">
                    Outpatient OPD
                  </div>
                </div>
                <div className="p-5 pt-0 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-base">Patient-Centric Consultations</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Consult with specialist physicians, manage schedules, and review verified medical encounter summaries in real time.
                    </p>
                  </div>
                  <Link to="/patient/login" className="text-xs font-semibold text-clinical-teal-700 hover:text-clinical-teal-800 flex items-center gap-1 pt-2">
                    Book consultation <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-apple-2xl bg-slate-50 border border-slate-200/70 overflow-hidden space-y-4 hover:shadow-apple-card transition-all flex flex-col justify-between">
                <div className="h-48 w-full overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=800"
                    alt="Diagnostic Pathology"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-clinical-teal-700 shadow-2xs">
                    Pathology Laboratory
                  </div>
                </div>
                <div className="p-5 pt-0 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-base">Certified Pathology & Diagnostics</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      ISO-standard automated blood pathology, reference range analysis, fast report delivery, and instant SMS verification.
                    </p>
                  </div>
                  <a href="#laboratory" className="text-xs font-semibold text-clinical-teal-700 hover:text-clinical-teal-800 flex items-center gap-1 pt-2">
                    Order diagnostic tests <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-apple-2xl bg-slate-50 border border-slate-200/70 overflow-hidden space-y-4 hover:shadow-apple-card transition-all flex flex-col justify-between">
                <div className="h-48 w-full overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800"
                    alt="Dispensary"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-clinical-teal-700 shadow-2xs">
                    Central Dispensary
                  </div>
                </div>
                <div className="p-5 pt-0 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-base">Online Pharmacy & Delivery</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Licensed hospital formulary, batch expiry checks, instant PayHere checkout, and express door-to-door medicine delivery.
                    </p>
                  </div>
                  <a href="#pharmacy" className="text-xs font-semibold text-clinical-teal-700 hover:text-clinical-teal-800 flex items-center gap-1 pt-2">
                    Browse medications <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Pharmacy Store Section */}
        <section id="pharmacy" className="py-16 bg-slate-100/70 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-clinical-teal-50 border border-clinical-teal-200 text-clinical-teal-800 text-[11px] font-bold uppercase mb-2">
                  <Pill className="h-3.5 w-3.5 text-clinical-teal-600" />
                  Hospital Formulary Online Store
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Purchase Quality Prescription & OTC Medications
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
                  Verified hospital medications dispensed by licensed pharmacists. Pay securely via PayHere Sandbox or bank transfer.
                </p>
              </div>

              {totalCartCount > 0 && (
                <button
                  onClick={handlePharmacyCheckout}
                  className="apple-btn px-5 py-2.5 rounded-xl bg-clinical-teal-600 hover:bg-clinical-teal-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 shrink-0"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    Checkout ({totalCartCount} items &bull; LKR {totalCartPrice.toFixed(2)})
                  </span>
                </button>
              )}
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 apple-card p-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search medication by brand, generic name..."
                  value={pharmacySearch}
                  onChange={(e) => setPharmacySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinical-teal-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`apple-btn px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-clinical-teal-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Formularies' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Drug Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredDrugs.map((drug) => {
                const qty = landingCart[drug.id] || 0;

                return (
                  <div key={drug.id} className="apple-card p-4 space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {drug.itemCode}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 mt-1 leading-tight">{drug.brandName}</h4>
                          <p className="text-xs text-clinical-teal-700 italic">{drug.genericName}</p>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200 shrink-0">
                          {drug.category}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                        <div>Form: <span className="font-semibold text-slate-700">{drug.dosageForm}</span></div>
                        <div>Strength: <span className="font-semibold text-slate-700">{drug.strength}</span></div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold">UNIT TARIFF</span>
                        <span className="text-sm font-bold font-mono text-slate-900">
                          LKR {Number(drug.unitPrice).toFixed(2)}
                        </span>
                      </div>

                      {qty > 0 ? (
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                          <button
                            onClick={() => updateCart(drug.id, -1)}
                            className="h-6 w-6 rounded bg-white font-bold text-xs flex items-center justify-center hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono font-bold px-1">{qty}</span>
                          <button
                            onClick={() => updateCart(drug.id, 1)}
                            className="h-6 w-6 rounded bg-white font-bold text-xs flex items-center justify-center hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateCart(drug.id, 1)}
                          className="apple-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-clinical-teal-600 hover:bg-clinical-teal-700 text-white text-xs font-semibold shadow-xs"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Diagnostic Laboratory & Blood Card Section */}
        <section id="laboratory" className="py-16 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase mb-2">
                  <FlaskConical className="h-3.5 w-3.5 text-emerald-600" />
                  Clinical Pathology & Blood Cards
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Book Diagnostic Lab Investigations
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
                  Fast, accurate laboratory diagnostics. Receive automated SMS and WhatsApp updates the moment your verified lab report is ready.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>SMS Alerts Active</span>
                </div>
                <div className="flex items-center gap-1.5 text-clinical-teal-700 bg-clinical-teal-50 px-2.5 py-1 rounded-lg border border-clinical-teal-200">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Same-Day Turnaround</span>
                </div>
              </div>
            </div>

            {/* Lab Test Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {LAB_TESTS_FEATURED.map((test) => (
                <div key={test.id} className="apple-card p-5 space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-clinical-teal-700 bg-clinical-teal-50 px-1.5 py-0.5 rounded border border-clinical-teal-200">
                        {test.testCode}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {test.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{test.testName}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{test.desc}</p>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Specimen:</span>
                        <span className="font-semibold text-slate-700">{test.sampleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Result Time:</span>
                        <span className="font-bold text-emerald-700">{test.turnaround}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-semibold">LAB FEE</span>
                      <span className="text-sm font-bold font-mono text-slate-900">
                        LKR {Number(test.price).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleBookLabTest(test)}
                      className="apple-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-clinical-teal-600 hover:bg-clinical-teal-700 text-white text-xs font-semibold shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Book Test</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Floating Cart Checkout Banner */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom duration-200">
          <div className="apple-card p-4 bg-slate-900 text-white shadow-2xl flex items-center gap-4 rounded-2xl border border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-clinical-teal-600 flex items-center justify-center font-bold text-white shadow-sm">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-300">
                {totalCartCount} item{totalCartCount > 1 ? 's' : ''} in your medication cart
              </div>
              <div className="text-base font-bold font-mono text-white">
                Total: LKR {totalCartPrice.toFixed(2)}
              </div>
            </div>
            <button
              onClick={handlePharmacyCheckout}
              className="apple-btn px-4 py-2 bg-clinical-teal-500 hover:bg-clinical-teal-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg overflow-hidden bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center p-0.5">
              <img src="/pulseos-logo.jpg" alt="PulseOS Logo" className="h-full w-full object-contain rounded" />
            </div>
            <span className="font-bold text-slate-800">PulseOS Hospital Management System</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/physicians" className="hover:text-clinical-teal-700 font-medium">Physicians</Link>
            <Link to="/services" className="hover:text-clinical-teal-700 font-medium">Tariffs</Link>
            <Link to="/patient/login" className="hover:text-clinical-teal-700 font-medium">Patient Portal</Link>
            <span className="text-slate-300">|</span>
            <Link to="/admin" className="hover:text-clinical-teal-700 font-medium text-slate-400">
              Staff Clinical Station
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;
