import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Doctor } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AppointmentModalProps {
  doctor: Doctor | null;
  onClose: () => void;
}

export default function AppointmentModal({ doctor, onClose }: AppointmentModalProps) {
  const [step, setStep] = React.useState<'form' | 'success'>('form');
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    date: '',
    time: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !auth.currentUser) return;

    setLoading(true);
    const path = 'appointments';
    try {
      await addDoc(collection(db, path), {
        id: crypto.randomUUID(),
        patientUid: auth.currentUser.uid,
        patientName: auth.currentUser.displayName || 'Anonymous Patient',
        doctorId: doctor.id,
        doctorName: doctor.name,
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setStep('success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-card-bg w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-border-main"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-bg-main rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>

          {step === 'form' ? (
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-xl object-cover" />
                <div>
                  <h3 className="text-xl font-bold text-text-main">Book Appointment</h3>
                  <p className="text-primary font-bold">{doctor.name} • {doctor.specialty}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Date
                    </label>
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Time
                    </label>
                    <select
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="">Select time</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Health Concern (e.g. Fever, Headache)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Describe your symptoms..."
                    className="input-field w-full resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Appointment'}
                </button>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-text-main mb-2">Appointment Booked!</h3>
              <p className="text-text-muted mb-8">
                Your request has been sent to {doctor.name}. You can track the status in your dashboard.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-text-main text-white py-4 rounded-lg font-bold hover:opacity-90 transition-all"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
