import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { patientApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { UserRound, Lock, AlertCircle, ChevronLeft, Mail, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export const PatientSignupView: React.FC = () => {
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    password: '',
    nicPassportNo: '',
    email: '',
    contactNumber: '',
    address: '',
    gender: 'OTHER',
    dob: '',
    bloodGroup: 'Unknown'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setPatientSession } = useRole();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nicPassportNo || !formData.firstName || !formData.lastName || !formData.password) {
      setError('Please fill in all required fields including password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if patient already exists
      try {
        const checkRes = await patientApi.search(formData.nicPassportNo.trim());
        const existing = checkRes.data;
        if (existing && existing.length > 0) {
          setError('An account with this NIC/Passport already exists. Please log in.');
          setLoading(false);
          return;
        }
      } catch (err: any) {
        // Not found is good, proceed
      }

      // Create new patient directly via standard REST API
      const payload = {
        ...formData,
        triagePriority: 'ROUTINE',
        dob: formData.dob || '1995-01-01',
        bloodGroup: formData.bloodGroup === 'Unknown' ? 'O+' : formData.bloodGroup
      };
      
      const response = await patientApi.create(payload);
      const createdPatient = response.data;

      // Save to context
      const newPatient = {
        ...createdPatient,
        id: createdPatient.id,
        patientId: `PAT-${createdPatient.id}`,
        nicPassportNo: formData.nicPassportNo,
        firstName: createdPatient.firstName || formData.firstName,
        lastName: createdPatient.lastName || formData.lastName,
        fullName: `${createdPatient.firstName || formData.firstName} ${createdPatient.lastName || formData.lastName}`,
        dob: payload.dob,
        gender: payload.gender,
        bloodGroup: payload.bloodGroup,
        contactNumber: payload.contactNumber,
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
        triagePriority: 'ROUTINE',
        registrationDate: new Date().toISOString().split('T')[0],
        isArchived: false
      } as any;

      setPatientSession(newPatient);
      
      sessionStorage.setItem('currentPatientId', createdPatient.id.toString());
      sessionStorage.setItem('currentPatientNic', formData.nicPassportNo);
      sessionStorage.setItem('currentPatientName', newPatient.fullName);
      
      showToast('success', 'Success', 'Account created successfully!');
      navigate('/patient/portal');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while creating your account.');
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/patient/login" className="font-semibold text-clinical-teal-700 hover:text-clinical-teal-800">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-apple-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-slate-900 mb-1.5">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="apple-input block w-full sm:text-sm rounded-xl py-2.5 px-3 border-slate-200 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-slate-900 mb-1.5">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="apple-input block w-full sm:text-sm rounded-xl py-2.5 px-3 border-slate-200 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
                />
              </div>

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
                    placeholder="••••••••"
                    className="apple-input block w-full pl-10 sm:text-sm rounded-xl py-2.5 border-slate-200 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
                  />
                </div>
              </div>

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
                    className="apple-input block w-full pl-10 sm:text-sm rounded-xl py-2.5 border-slate-200 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
                  />
                </div>
              </div>

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
                    className="apple-input block w-full pl-10 sm:text-sm rounded-xl py-2.5 border-slate-200 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
                  />
                </div>
              </div>

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
                    className="apple-input block w-full pl-10 sm:text-sm rounded-xl py-2.5 border-slate-200 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
                  />
                </div>
              </div>
              
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

              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-slate-900 mb-1.5">Gender</label>
                <select
                  name="gender"
                  id="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="apple-input block w-full sm:text-sm rounded-xl py-2.5 px-3 border-slate-200 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-semibold text-slate-900 mb-1.5">Blood Group</label>
                <select
                  name="bloodGroup"
                  id="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="apple-input block w-full sm:text-sm rounded-xl py-2.5 px-3 border-slate-200 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
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
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading}
                className="apple-btn w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-clinical-teal-600 hover:bg-clinical-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clinical-teal-500 disabled:opacity-70 transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
