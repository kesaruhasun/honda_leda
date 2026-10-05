import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, patientApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { UserRound, Lock, AlertCircle, ChevronLeft, Mail, Phone, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { Patient } from '../../types';

export const PatientSignupView: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    nicPassportNo: '',
    email: '',
    contactNumber: '',
    address: '',
    gender: 'MALE',
    dob: '',
    bloodGroup: 'Unknown'
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setPatientSession } = useRole();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required.';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters.';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required.';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!formData.nicPassportNo.trim()) {
      errors.nicPassportNo = 'NIC or Passport number is required.';
    } else if (formData.nicPassportNo.trim().length < 5) {
      errors.nicPassportNo = 'Enter a valid NIC or Passport number (min 5 characters).';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) {
      setFormError('Please correct the highlighted fields before submitting.');
      return;
    }

    setLoading(true);

    try {
      // 1. Check if patient already exists
      try {
        const checkRes = await patientApi.search(formData.nicPassportNo.trim());
        if (checkRes.data && checkRes.data.length > 0) {
          const exists = checkRes.data.some(
            (p: any) => p.nicPassportNo?.toLowerCase() === formData.nicPassportNo.trim().toLowerCase()
          );
          if (exists) {
            setFormError('An account with this NIC/Passport already exists. Please sign in.');
            setLoading(false);
            return;
          }
        }
      } catch (err: any) {
        // Search threw error, proceed with creation
      }

      // 2. Build clean registration payload mapped to Spring Boot backend requirements
      const payload: Partial<Patient> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        nicPassportNo: formData.nicPassportNo.trim(),
        contactNumber: formData.contactNumber.trim(),
        phoneNumber: formData.contactNumber.trim(),
        email: formData.email ? formData.email.trim() : undefined,
        address: formData.address ? formData.address.trim() : undefined,
        password: formData.password,
        triagePriority: 'ROUTINE',
        dob: formData.dob || '1995-01-01',
        dateOfBirth: formData.dob || '1995-01-01',
        gender: (formData.gender ? formData.gender.toUpperCase() : 'MALE') as any,
        bloodGroup: (formData.bloodGroup === 'Unknown' ? 'O+' : formData.bloodGroup) as any,
      };
      
      const response = await patientApi.create(payload);
      const createdPatient = response.data;

      // 3. Auto-authenticate with backend JWT token
      try {
        const loginRes = await authApi.login({
          username: formData.nicPassportNo.trim(),
          password: formData.password,
        });
        if (loginRes.data?.token) {
          localStorage.setItem('token', loginRes.data.token);
          sessionStorage.setItem('token', loginRes.data.token);
        }
      } catch (loginErr) {
        console.warn('Auto-login after registration fallback token check', loginErr);
      }

      // 4. Update role session context & storage
      const newPatientSession = {
        ...createdPatient,
        id: createdPatient.id,
        patientId: `PAT-${createdPatient.id}`,
        nicPassportNo: formData.nicPassportNo.trim(),
        firstName: createdPatient.firstName || formData.firstName.trim(),
        lastName: createdPatient.lastName || formData.lastName.trim(),
        fullName: `${createdPatient.firstName || formData.firstName.trim()} ${createdPatient.lastName || formData.lastName.trim()}`.trim(),
        dob: payload.dob,
        dateOfBirth: payload.dob,
        gender: payload.gender,
        bloodGroup: payload.bloodGroup,
        contactNumber: payload.contactNumber,
        phoneNumber: payload.contactNumber,
        email: payload.email,
        address: payload.address,
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
        triagePriority: 'ROUTINE',
        registrationDate: new Date().toISOString().split('T')[0],
        isArchived: false
      } as any;

      setPatientSession(newPatientSession);
      
      sessionStorage.setItem('currentPatientId', createdPatient.id.toString());
      sessionStorage.setItem('currentPatientNic', formData.nicPassportNo.trim());
      sessionStorage.setItem('currentPatientName', newPatientSession.fullName);
      sessionStorage.setItem('currentPatientData', JSON.stringify(newPatientSession));
      
      showToast('success', 'Account Registered', 'Welcome to PulseOS! Your account has been saved in the database.');
      navigate('/patient/portal');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'An unexpected error occurred while creating your account.';
      setFormError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors text-sm font-medium">
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-0.5">
            <img src="/pulseos-logo.jpg" alt="PulseOS Logo" className="h-full w-full object-contain rounded-lg" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Create Patient Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/patient/login" className="font-semibold text-clinical-teal-700 hover:text-clinical-teal-800">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-apple-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSignup} noValidate>
            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{formError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-slate-900 mb-1.5">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="e.g. Ruwan"
                  className={`apple-input block w-full sm:text-sm rounded-xl py-2.5 px-3 border ${
                    fieldErrors.firstName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:ring-clinical-teal-500 focus:border-clinical-teal-500`}
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-slate-900 mb-1.5">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="e.g. Perera"
                  className={`apple-input block w-full sm:text-sm rounded-xl py-2.5 px-3 border ${
                    fieldErrors.lastName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:ring-clinical-teal-500 focus:border-clinical-teal-500`}
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.lastName}</p>
                )}
              </div>

              {/* Password */}
              <div className="sm:col-span-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-1.5">Create Password *</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="•••••••• (min 6 characters)"
                    className={`apple-input block w-full pl-10 sm:text-sm rounded-xl py-2.5 border ${
                      fieldErrors.password ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    } focus:ring-clinical-teal-500 focus:border-clinical-teal-500`}
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.password}</p>
                )}
              </div>

              {/* NIC / Passport Number */}
              <div className="sm:col-span-2">
                <label htmlFor="nicPassportNo" className="block text-sm font-semibold text-slate-900 mb-1.5">NIC or Passport Number *</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserRound className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="nicPassportNo"
                    id="nicPassportNo"
                    required
                    value={formData.nicPassportNo}
                    onChange={handleInputChange}
                    placeholder="e.g. 199012345678 or N8273645"
                    className={`apple-input block w-full pl-10 sm:text-sm rounded-xl py-2.5 border ${
                      fieldErrors.nicPassportNo ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    } focus:ring-clinical-teal-500 focus:border-clinical-teal-500`}
                  />
                </div>
                {fieldErrors.nicPassportNo && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.nicPassportNo}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-1.5">Email Address</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="patient@example.lk"
                    className={`apple-input block w-full pl-10 sm:text-sm rounded-xl py-2.5 border ${
                      fieldErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    } focus:ring-clinical-teal-500 focus:border-clinical-teal-500`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-semibold text-slate-900 mb-1.5">Phone Number</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    name="contactNumber"
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="0771234567"
                    className="apple-input block w-full pl-10 sm:text-sm rounded-xl py-2.5 border-slate-200 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
                  />
                </div>
              </div>
              
              {/* DOB */}
              <div>
                <label htmlFor="dob" className="block text-sm font-semibold text-slate-900 mb-1.5">Date of Birth</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    name="dob"
                    id="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="apple-input block w-full pl-10 sm:text-sm rounded-xl py-2.5 border-slate-200 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-slate-900 mb-1.5">Gender</label>
                <select
                  name="gender"
                  id="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="apple-input block w-full sm:text-sm rounded-xl py-2.5 px-3 border-slate-200 focus:ring-clinical-teal-500 focus:border-clinical-teal-500 bg-white"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-semibold text-slate-900 mb-1.5">Blood Group</label>
                <select
                  name="bloodGroup"
                  id="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="apple-input block w-full sm:text-sm rounded-xl py-2.5 px-3 border-slate-200 focus:ring-clinical-teal-500 focus:border-clinical-teal-500 bg-white"
                >
                  <option value="Unknown">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              {/* Residential Address */}
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-semibold text-slate-900 mb-1.5">Residential Address</label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. 42/B, Galle Road, Colombo 03"
                  className="apple-input block w-full sm:text-sm rounded-xl py-2.5 px-3 border-slate-200 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading}
                className="apple-btn w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-clinical-teal-600 hover:bg-clinical-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clinical-teal-500 disabled:opacity-70 transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Registration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
