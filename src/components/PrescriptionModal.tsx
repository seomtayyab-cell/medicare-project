import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pill, User, Calendar, MessageSquare } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { UserProfile, Prescription } from '../types';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: UserProfile | null;
  prescription?: Prescription & { firestoreId: string } | null;
  appointmentId?: string | null;
}

export default function PrescriptionModal({ isOpen, onClose, patient, prescription, appointmentId }: PrescriptionModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    doctorName: '',
    medicine: '',
    instructions: '',
    date: new Date().toISOString().split('T')[0],
    status: 'active' as Prescription['status']
  });

  React.useEffect(() => {
    if (prescription) {
      setFormData({
        doctorName: prescription.doctorName || '',
        medicine: prescription.medicine || '',
        instructions: prescription.instructions || '',
        date: prescription.date || new Date().toISOString().split('T')[0],
        status: (prescription.status as any) || 'active'
      });
    } else {
      setFormData({
        doctorName: '',
        medicine: '',
        instructions: '',
        date: new Date().toISOString().split('T')[0],
        status: 'active'
      });
    }
  }, [prescription, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient && !prescription) return;
    setLoading(true);

    const path = 'prescriptions';
    try {
      if (prescription) {
        await updateDoc(doc(db, 'prescriptions', prescription.firestoreId), {
          doctorName: formData.doctorName,
          medicine: formData.medicine,
          instructions: formData.instructions,
          date: formData.date,
          status: formData.status
        });
      } else {
        await addDoc(collection(db, path), {
          id: crypto.randomUUID(),
          patientUid: patient!.uid,
          doctorName: formData.doctorName,
          medicine: formData.medicine,
          instructions: formData.instructions,
          date: formData.date,
          status: 'active',
          createdAt: serverTimestamp(),
          appointmentId: appointmentId || null
        });

        // Update appointment status if this prescription is linked to one
        if (appointmentId) {
          await updateDoc(doc(db, 'appointments', appointmentId), {
            status: 'prescription-issued'
          });
        }
      }
      onClose();
    } catch (error) {
      handleFirestoreError(error, prescription ? OperationType.UPDATE : OperationType.CREATE, path);
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
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {prescription ? 'Edit Prescription' : 'Write Prescription'}
            </h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              {prescription ? `Updating for patient` : `For ${patient?.displayName}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {prescription && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="input-field-modern"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="checked">Checked</option>
                </select>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                <User className="w-4 h-4 text-primary" /> Prescribed By
              </label>
              <input
                required
                type="text"
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                placeholder="Dr. Johnson"
                className="input-field-modern"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                <Pill className="w-4 h-4 text-primary" /> Medications
              </label>
              <textarea
                required
                rows={3}
                value={formData.medicine}
                onChange={(e) => setFormData({ ...formData, medicine: e.target.value })}
                placeholder="Paracetamol 500mg, Amoxicillin 250mg..."
                className="input-field-modern resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                <MessageSquare className="w-4 h-4 text-primary" /> Dosage & Frequency
              </label>
              <textarea
                required
                rows={3}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Take 1 tablet after meals, 3 times a day for 5 days."
                className="input-field-modern resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                <Calendar className="w-4 h-4 text-primary" /> Date
              </label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field-modern"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 btn-primary mt-4 disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : 'Send Prescription'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
