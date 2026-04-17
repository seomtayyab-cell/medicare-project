import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, User, Calendar, Link as LinkIcon } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: UserProfile | null;
}

export default function ReportModal({ isOpen, onClose, patient }: ReportModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: '',
    fileUrl: '',
    date: new Date().toISOString().split('T')[0],
    doctorName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setLoading(true);

    const path = 'reports';
    try {
      await addDoc(collection(db, path), {
        id: crypto.randomUUID(),
        patientUid: patient.uid,
        title: formData.title,
        fileUrl: formData.fileUrl,
        date: formData.date,
        doctorName: formData.doctorName || 'General Clinic',
        createdAt: serverTimestamp()
      });
      onClose();
      setFormData({
        title: '',
        fileUrl: '',
        date: new Date().toISOString().split('T')[0],
        doctorName: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !patient) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 sm:p-10 my-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-slate-50 text-slate-400 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upload Medical Report</h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">Assign a new document to {patient.displayName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                <FileText className="w-4 h-4 text-primary" /> Report Title
              </label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Blood Test Result"
                className="input-field-modern"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                <LinkIcon className="w-4 h-4 text-primary" /> Report PDF URL
              </label>
              <input
                required
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                placeholder="https://example.com/report.pdf"
                className="input-field-modern"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                  <Calendar className="w-4 h-4 text-primary" /> Issue Date
                </label>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field-modern"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                  <User className="w-4 h-4 text-primary" /> Doctor Name
                </label>
                <input
                  type="text"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  placeholder="e.g. Dr. Smith"
                  className="input-field-modern"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 btn-primary mt-4 disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? 'Uploading...' : 'Assign Report'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
