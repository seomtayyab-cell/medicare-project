import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, User, Search, X, Pill, Bot, Sparkles } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Appointment, Prescription } from '../types';
import { cn } from '../lib/utils';
import AIAssistant from './AIAssistant';

export default function PatientDashboard() {
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([]);
  const [activeTab, setActiveTab] = React.useState<'appointments' | 'prescriptions' | 'ai'>('appointments');
  const [selectedPx, setSelectedPx] = React.useState<Prescription | null>(null);

  React.useEffect(() => {
    if (!auth.currentUser) return;

    const qAppts = query(
      collection(db, 'appointments'),
      where('patientUid', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const qPrescriptions = query(
      collection(db, 'prescriptions'),
      where('patientUid', '==', auth.currentUser.uid),
      orderBy('date', 'desc')
    );

    const unsubAppts = onSnapshot(qAppts, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Appointment)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    const unsubPrescriptions = onSnapshot(qPrescriptions, (snapshot) => {
      setPrescriptions(snapshot.docs.map(doc => doc.data() as Prescription));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'prescriptions');
    });

    return () => {
      unsubAppts();
      unsubPrescriptions();
    };
  }, [auth.currentUser]);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Hello, {auth.currentUser?.displayName}</h1>
            <p className="text-text-muted">Your health summary for today, {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-border-main text-sm font-bold text-text-muted hover:bg-slate-50 transition-all">
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('appointments')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all",
                activeTab === 'appointments' ? "bg-primary-light text-primary border-l-4 border-primary" : "text-text-muted hover:bg-white"
              )}
            >
              <Calendar className="w-5 h-5" /> Appointments
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all",
                activeTab === 'prescriptions' ? "bg-primary-light text-primary border-l-4 border-primary" : "text-text-muted hover:bg-white"
              )}
            >
              <Pill className="w-5 h-5" /> Prescriptions
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all border border-transparent",
                activeTab === 'ai' 
                  ? "bg-indigo-50 text-indigo-600 border-l-4 border-l-indigo-600" 
                  : "text-indigo-500/80 hover:bg-indigo-50/50"
              )}
            >
              <div className="relative">
                <Bot className="w-5 h-5" />
                <Sparkles className="w-2.5 h-2.5 absolute -top-1 -right-1 text-amber-400" />
              </div>
              Medicare AI Helper
            </button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'appointments' ? (
                <motion.div
                  key="appointments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {appointments.length > 0 ? (
                    appointments.map((appt) => (
                      <div key={appt.id} className="glass-panel p-6 flex items-center justify-between gap-6 hover:border-primary transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-text-main">{appt.doctorName}</h3>
                            <p className="text-xs text-text-muted italic mb-1">"{appt.notes}"</p>
                            <div className="flex items-center gap-3 text-sm text-text-muted mt-1">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {appt.date}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {appt.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              appt.status === 'confirmed' ? "bg-primary-light text-primary-dark" :
                              appt.status === 'prescription-issued' ? "bg-indigo-100 text-indigo-700 font-extrabold" :
                              appt.status === 'cancelled' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                            )}>
                              {appt.status.replace('-', ' ')}
                            </span>
                            <button className="text-text-muted hover:text-red-600">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          {appt.status === 'prescription-issued' && (
                            <button 
                              onClick={() => {
                                const px = prescriptions.find(p => p.appointmentId === appt.id);
                                if (px) setSelectedPx(px);
                                else setActiveTab('prescriptions');
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                            >
                              <Pill className="w-3 h-3" />
                              See Prescription
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="glass-panel p-12 text-center border-dashed">
                      <Calendar className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-text-main mb-1">No appointments yet</h3>
                      <p className="text-text-muted">Book your first visit with one of our specialists.</p>
                    </div>
                  )}
                </motion.div>
              ) : activeTab === 'prescriptions' ? (
                <motion.div
                  key="prescriptions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {prescriptions.length > 0 ? (
                    prescriptions.map((px) => (
                      <div key={px.id} className="glass-panel p-8 hover:border-indigo-500 transition-all border-l-8 border-l-indigo-500">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                              <Pill className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-slate-900 tracking-tight">{px.doctorName}</h3>
                              <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{px.date}</p>
                            </div>
                          </div>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                            px.status === 'active' ? "bg-indigo-100 text-indigo-700" : 
                            px.status === 'checked' ? "bg-emerald-100 text-emerald-700" :
                            "bg-slate-100 text-slate-500"
                          )}>
                            {px.status}
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-slate-50 p-4 rounded-2xl">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Medicine</span>
                            <p className="text-sm font-bold text-slate-700 leading-relaxed">{px.medicine}</p>
                          </div>
                          
                          <div className="bg-indigo-50/50 p-4 rounded-2xl">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Instructions</span>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{px.instructions}"</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="glass-panel p-12 text-center border-dashed">
                      <Pill className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-text-main mb-1">No prescriptions found</h3>
                      <p className="text-text-muted">Once a doctor prescribes medicine, it will appear here.</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <AIAssistant onClose={() => setActiveTab('appointments')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedPx && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 sm:p-12 overflow-hidden"
            >
              <button
                onClick={() => setSelectedPx(null)}
                className="absolute top-6 right-6 p-2.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-all duration-300 z-30"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                  <Pill className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Prescription Issued</h2>
                <p className="text-indigo-600 font-bold text-sm tracking-widest mt-1 uppercase">{selectedPx.date}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 px-1">Prescribed By</span>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="font-bold text-slate-800">{selectedPx.doctorName}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 px-1">Medicine</span>
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <p className="font-bold text-indigo-700">{selectedPx.medicine}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 px-1">Instructions</span>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 border-dashed">
                    <p className="text-sm font-medium text-slate-600 italic leading-relaxed">"{selectedPx.instructions}"</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setSelectedPx(null)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                  >
                    Close View
                  </button>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 -mr-16 -mt-16 rounded-full blur-3xl opacity-50" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100 -ml-16 -mb-16 rounded-full blur-3xl opacity-50" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
