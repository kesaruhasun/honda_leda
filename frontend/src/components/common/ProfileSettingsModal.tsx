import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { patientApi } from '../../services/api';
import { Patient } from '../../types';
import { useToast } from '../../context/ToastContext';
import { RefreshCw, CheckCircle2, Phone, MapPin, User, Mail, Shield } from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSuccess: (updatedPatient: Patient) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    email: patient?.email || '',
    contactNumber: patient?.contactNumber || patient?.phoneNumber || '',
    address: patient?.address || '',
    emergencyContactName: patient?.emergencyContactName || '',
    emergencyContactRelationship: patient?.emergencyContactRelationship || '',
    emergencyContactPhone: patient?.emergencyContactPhone || '',
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        email: patient.email || '',
        contactNumber: patient.contactNumber || patient.phoneNumber || '',
        address: patient.address || '',
        emergencyContactName: patient.emergencyContactName || '',
        emergencyContactRelationship: patient.emergencyContactRelationship || '',
        emergencyContactPhone: patient.emergencyContactPhone || '',
      });
    }
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const trimmedFirstName = formData.firstName.trim();
      const trimmedLastName = formData.lastName.trim();
      const resolvedFullName = `${trimmedFirstName} ${trimmedLastName}`.trim();

      const payload: Partial<Patient> = {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        fullName: resolvedFullName,
        email: formData.email.trim(),
        contactNumber: formData.contactNumber.trim(),
        phoneNumber: formData.contactNumber.trim(),
        address: formData.address.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactRelationship: formData.emergencyContactRelationship.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
      };

      const res = await patientApi.update(patient.id, payload);
      
      // Ensure we merge the response data with existing patient data for reactive updates
      const updatedData = {
        ...patient,
        ...res.data,
        // Ensure manual fields are set if response is partial
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        fullName: resolvedFullName,
        email: formData.email.trim(),
        contactNumber: formData.contactNumber.trim(),
        phoneNumber: formData.contactNumber.trim(),
        address: formData.address.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactRelationship: formData.emergencyContactRelationship.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
      };

      onSuccess(updatedData);
      showToast('success', 'Settings Updated', 'Your profile settings and contact information have been successfully synchronized.');
      onClose();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'An error occurred while updating your profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile & Account Settings"
      subtitle="Manage your contact information, residential address, and emergency notifications"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs font-sans p-1">
        {/* Security / Identity Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-clinical-teal-100 rounded-lg">
              <Shield className="h-5 w-5 text-clinical-teal-700" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider">National Digital ID</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{patient?.nicPassportNo}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 uppercase tracking-tighter">
              ✓ Verified Identity
            </span>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <User className="h-4 w-4 text-slate-400" />
            <h3 className="font-bold text-slate-700 uppercase tracking-wide text-[11px]">Identity & Account</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500 focus:border-clinical-teal-500 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500 focus:border-clinical-teal-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500 transition-all shadow-sm"
                placeholder="email@example.com"
              />
            </div>
          </div>
        </div>

        {/* Contact & Residential */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <MapPin className="h-4 w-4 text-slate-400" />
            <h3 className="font-bold text-slate-700 uppercase tracking-wide text-[11px]">Contact & Residential</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Primary Contact Phone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="077 123 4567"
                  className="w-full text-xs pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500 transition-all shadow-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">Residential Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 42/B, Galle Road, Colombo 03"
              rows={2}
              className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500 transition-all shadow-sm resize-none"
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4 p-4 bg-rose-50/30 border border-rose-100 rounded-xl">
          <div className="flex items-center gap-2 pb-1 border-b border-rose-100">
            <Phone className="h-4 w-4 text-rose-400" />
            <h3 className="font-bold text-rose-700 uppercase tracking-wide text-[11px]">Emergency Next-of-Kin</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500 font-semibold uppercase">Contact Name</label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500 font-semibold uppercase">Relationship</label>
              <input
                type="text"
                value={formData.emergencyContactRelationship}
                onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500 font-semibold uppercase">Phone Number</label>
              <input
                type="text"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 text-xs font-bold bg-clinical-teal-600 hover:bg-clinical-teal-700 disabled:opacity-50 text-white rounded-xl transition-all flex items-center gap-2 shadow-md shadow-clinical-teal-600/20"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
