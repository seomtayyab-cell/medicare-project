import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Stethoscope, Briefcase, FileText, Image as ImageIcon } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Doctor } from '../types';

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: Doctor | null;
}

export default function DoctorModal({ isOpen, onClose, doctor }: DoctorModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    specialty: '',
    department: '',
    bio: '',
    image: ''
  });

  React.useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name,
        specialty: doctor.specialty,
        department: doctor.department,
        bio: doctor.bio,
        image: doctor.image
      });
    } else {
      setFormData({
        name: '',
        specialty: '',
        department: '',
        bio: '',
        image: ''
      });
    }
  }, [doctor, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const path = 'doctors';
    try {
      if (doctor?.id) {
        // Edit mode
        await updateDoc(doc(db, 'doctors', doctor.id), {
          ...formData
        });
      } else {
        // Add mode
        const docRef = await addDoc(collection(db, 'doctors'), {
          ...formData,
          id: '' // placeholder
        });
        
        await updateDoc(docRef, {
          id: docRef.id
        });
      }

      onClose();
    } catch (error) {
      handleFirestoreError(error, doctor ? OperationType.UPDATE : OperationType.CREATE, path);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_32px_120px_-10px_rgba(0,0,0,0.3)] border border-slate-100 p-8 sm:p-12 my-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-all duration-300 z-30 border border-transparent hover:border-slate-100 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {doctor ? 'Edit Doctor' : 'Add New Doctor'}
            </h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              {doctor ? 'Update the details of this medical specialist.' : 'Enter the details of the new medical specialist.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                <User className="w-4 h-4 text-primary" /> Full Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. John Doe"
                className="block w-full h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                  <Stethoscope className="w-4 h-4 text-primary" /> Specialty
                </label>
                <input
                  required
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="e.g. Cardiologist"
                  className="block w-full h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 font-medium whitespace-nowrap overflow-ellipsis"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                  <Briefcase className="w-4 h-4 text-primary" /> Department
                </label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="block w-full h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 font-medium appearance-none"
                >
                  <option value="">Select Dept</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                <ImageIcon className="w-4 h-4 text-primary" /> Image URL
              </label>
              <input
                required
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="block w-full h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 font-medium"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                <FileText className="w-4 h-4 text-primary" /> Bio / Description
              </label>
              <textarea
                required
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief professional background..."
                rows={3}
                className="block w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 font-medium resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 btn-primary mt-4 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <User className="w-5 h-5" />
                  <span className="text-base font-bold">
                    {doctor ? 'Save Changes' : 'Register Doctor'}
                  </span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
