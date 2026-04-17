import React from 'react';
import { motion } from 'motion/react';
import { Users, Calendar, Settings, Check, X, AlertCircle, TrendingUp, UserPlus, FileEdit, Stethoscope, FileUp, LayoutDashboard, Trash2, Pill } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Appointment, UserProfile, Doctor, Prescription } from '../types';
import { cn } from '../lib/utils';
import DoctorModal from './DoctorModal';
import ReportModal from './ReportModal';
import PrescriptionModal from './PrescriptionModal';

export default function AdminDashboard() {
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [prescriptions, setPrescriptions] = React.useState<(Prescription & { firestoreId: string })[]>([]);
  const [stats, setStats] = React.useState({ total: 0, pending: 0, confirmed: 0 });
  const [isDoctorModalOpen, setIsDoctorModalOpen] = React.useState(false);
  const [editingDoctor, setEditingDoctor] = React.useState<Doctor | null>(null);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'patients' | 'prescriptions'>('overview');
  const [selectedPatient, setSelectedPatient] = React.useState<UserProfile | null>(null);
  const [editingPrescription, setEditingPrescription] = React.useState<(Prescription & { firestoreId: string }) | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = React.useState(false);
  const [targetAppointmentId, setTargetAppointmentId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const qAppts = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const qUsers = query(collection(db, 'users'));
    const qDoctors = query(collection(db, 'doctors'));
    const qPrescriptions = query(collection(db, 'prescriptions'), orderBy('createdAt', 'desc'));

    const unsubAppts = onSnapshot(qAppts, (snapshot) => {
      const appts = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id } as Appointment & { firestoreId: string }));
      setAppointments(appts);
      setStats({
        total: appts.length,
        pending: appts.filter(a => a.status === 'pending').length,
        confirmed: appts.filter(a => a.status === 'confirmed').length
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    const unsubDoctors = onSnapshot(qDoctors, (snapshot) => {
      setDoctors(snapshot.docs.map(doc => doc.data() as Doctor));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'doctors');
    });

    const unsubPrescriptions = onSnapshot(qPrescriptions, (snapshot) => {
      setPrescriptions(snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id } as Prescription & { firestoreId: string })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'prescriptions');
    });

    return () => {
      unsubAppts();
      unsubUsers();
      unsubDoctors();
      unsubPrescriptions();
    };
  }, [auth.currentUser]);

  const updateStatus = async (firestoreId: string, status: string) => {
    const path = `appointments/${firestoreId}`;
    try {
      await updateDoc(doc(db, 'appointments', firestoreId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteAppointment = async (firestoreId: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    const path = `appointments/${firestoreId}`;
    try {
      await deleteDoc(doc(db, 'appointments', firestoreId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const deleteDoctor = async (doctorId: string) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    const path = `doctors/${doctorId}`;
    try {
      await deleteDoc(doc(db, 'doctors', doctorId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsDoctorModalOpen(true);
  };

  const handleAddDoctor = () => {
    setEditingDoctor(null);
    setIsDoctorModalOpen(true);
  };

  const handleUploadReport = (patient: UserProfile) => {
    setSelectedPatient(patient);
    setIsReportModalOpen(true);
  };

  const deletePrescription = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;
    try {
      await deleteDoc(doc(db, 'prescriptions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'prescriptions');
    }
  };

  const handleEditPrescription = (px: Prescription & { firestoreId: string }) => {
    setEditingPrescription(px);
    setSelectedPatient(users.find(u => u.uid === px.patientUid) || null);
    setTargetAppointmentId(null);
    setIsPrescriptionModalOpen(true);
  };

  const handlePrescription = (patient: UserProfile, appointmentId?: string) => {
    setEditingPrescription(null);
    setSelectedPatient(patient);
    setTargetAppointmentId(appointmentId || null);
    setIsPrescriptionModalOpen(true);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Admin Control Panel</h1>
            <p className="text-text-muted">Overview of hospital operations and patient management.</p>
            
            <div className="flex gap-2 mt-6 p-1 bg-bg-main border border-border-main rounded-xl w-fit">
              <button 
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  activeTab === 'overview' ? "bg-white shadow-sm text-primary" : "text-text-muted hover:text-text-main"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('patients')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  activeTab === 'patients' ? "bg-white shadow-sm text-primary" : "text-text-muted hover:text-text-main"
                )}
              >
                <Users className="w-4 h-4" />
                Registered Patients
              </button>
              <button 
                onClick={() => setActiveTab('prescriptions')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  activeTab === 'prescriptions' ? "bg-white shadow-sm text-primary" : "text-text-muted hover:text-text-main"
                )}
              >
                <Pill className="w-4 h-4" />
                All Prescriptions
              </button>
            </div>
          </div>
          <button 
            onClick={handleAddDoctor}
            className="btn-primary py-3 px-6 text-sm flex items-center gap-2 self-start md:self-auto shadow-lg shadow-emerald-600/20"
          >
            <UserPlus className="w-5 h-5" />
            Add New Doctor
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              <div className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-text-main">{stats.total}</div>
                <div className="text-sm text-text-muted">Total Appointments</div>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-text-main">{stats.pending}</div>
                <div className="text-sm text-text-muted">Pending Requests</div>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-text-main">{users.length}</div>
                <div className="text-sm text-text-muted">Registered Patients</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-panel overflow-hidden">
                  <div className="p-6 border-b border-border-main flex items-center justify-between">
                    <h2 className="text-xl font-bold text-text-main">Recent Appointments</h2>
                    <button className="text-sm font-bold text-primary hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-bg-main text-text-muted text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Patient Name</th>
                          <th className="px-6 py-4">Doctor</th>
                          <th className="px-6 py-4">Concern</th>
                          <th className="px-6 py-4">Date & Time</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-main">
                        {appointments.map((appt) => (
                          <tr key={appt.id} className="hover:bg-bg-main transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-text-main">{appt.patientName || 'Anonymous'}</div>
                              <div className="text-[10px] text-text-muted font-mono">{appt.patientUid.slice(0, 8)}...</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-text-main">{appt.doctorName}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-text-main line-clamp-1">{appt.notes || 'No concern provided'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-text-main">{appt.date}</div>
                              <div className="text-xs text-text-muted">{appt.time}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                                appt.status === 'confirmed' ? "bg-primary-light text-primary-dark" :
                                appt.status === 'cancelled' ? "bg-red-50 text-red-700" : "bg-amber-100 text-amber-700"
                              )}>
                                {appt.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {appt.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => updateStatus((appt as any).firestoreId, 'confirmed')}
                                      className="p-2 bg-primary-light text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => updateStatus((appt as any).firestoreId, 'cancelled')}
                                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                                      title="Cancel Appointment"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => deleteAppointment((appt as any).firestoreId)}
                                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                                  title="Delete Appointment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                
                                {users.find(u => u.uid === appt.patientUid) && (
                                  <>
                                    {prescriptions.some(p => p.appointmentId === (appt as any).firestoreId) ? (
                                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100 italic" title="Prescription has been sent">
                                        <Check className="w-3 h-3" />
                                        Sent
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handlePrescription(users.find(u => u.uid === appt.patientUid)!, (appt as any).firestoreId)}
                                        className="p-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                                        title="Write Prescription"
                                      >
                                        <Pill className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleUploadReport(users.find(u => u.uid === appt.patientUid)!)}
                                      className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                                      title="Upload Report"
                                    >
                                      <FileUp className="w-4 h-4" />
                                    </button>
                                  </>
                                )}

                                <button className="p-2 bg-bg-main text-text-muted rounded-lg hover:bg-border-main transition-all">
                                  <Settings className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="glass-panel p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-primary" />
                      Medical Staff
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {doctors.map(doctor => (
                      <div key={doctor.id} className="flex items-center gap-4 p-3 rounded-xl border border-border-main hover:border-primary/50 transition-all bg-bg-main/50">
                        <img 
                          src={doctor.image} 
                          alt={doctor.name} 
                          className="w-12 h-12 rounded-lg object-cover ring-2 ring-white"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-text-main truncate">{doctor.name}</div>
                          <div className="text-xs text-text-muted truncate">{doctor.specialty}</div>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleEditDoctor(doctor)}
                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Edit Doctor"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteDoctor(doctor.id)}
                            className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Doctor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'patients' ? (
          <div className="glass-panel overflow-hidden">
            <div className="p-6 border-b border-border-main">
              <h2 className="text-xl font-bold text-text-main">Registered Patients</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-bg-main text-text-muted text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Patient Info</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">UID</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main">
                  {users.filter(u => u.role === 'patient').map((patient) => (
                    <tr key={patient.uid} className="hover:bg-bg-main transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary font-bold">
                            {patient.displayName?.[0] || 'P'}
                          </div>
                          <div className="text-sm font-bold text-text-main">{patient.displayName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-text-main">{patient.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-text-muted font-mono">{patient.uid}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handlePrescription(patient)}
                            disabled={prescriptions.some(p => p.patientUid === patient.uid && p.status === 'active')}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg transition-all text-xs font-bold",
                              prescriptions.some(p => p.patientUid === patient.uid && p.status === 'active')
                                ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100 italic"
                                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white"
                            )}
                            title={prescriptions.some(p => p.patientUid === patient.uid && p.status === 'active') ? "Patient already has an active prescription" : "Write Prescription"}
                          >
                            <Pill className={cn("w-4 h-4", prescriptions.some(p => p.patientUid === patient.uid && p.status === 'active') ? "opacity-30" : "")} />
                            {prescriptions.some(p => p.patientUid === patient.uid && p.status === 'active') ? 'Prescribed' : 'Prescription'}
                          </button>
                          <button 
                            onClick={() => handleUploadReport(patient)}
                            className="flex items-center gap-2 p-2 bg-primary-light text-primary-dark rounded-lg hover:bg-primary hover:text-white transition-all text-xs font-bold"
                            title="Upload Report"
                          >
                            <FileUp className="w-4 h-4" />
                            Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.filter(u => u.role === 'patient').length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                        No registered patients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <div className="p-6 border-b border-border-main">
              <h2 className="text-xl font-bold text-text-main">Clinical Prescriptions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-bg-main text-text-muted text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Medicine</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main">
                  {prescriptions.map((px) => (
                    <tr key={px.firestoreId} className="hover:bg-bg-main transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-text-main">
                          {users.find(u => u.uid === px.patientUid)?.displayName || 'Unknown Patient'}
                        </div>
                        <div className="text-[10px] text-text-muted font-mono">{px.patientUid.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-text-main">{px.medicine}</div>
                        <div className="text-xs text-text-muted italic line-clamp-1">{px.instructions}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-main">{px.date}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                          px.status === 'checked' ? "bg-emerald-100 text-emerald-700" :
                          px.status === 'completed' ? "bg-slate-100 text-slate-500" : "bg-indigo-50 text-indigo-700"
                        )}>
                          {px.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditPrescription(px)}
                            className="p-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                            title="Edit"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePrescription(px.firestoreId)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {prescriptions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                        No prescriptions issued yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <DoctorModal 
        isOpen={isDoctorModalOpen} 
        onClose={() => setIsDoctorModalOpen(false)} 
        doctor={editingDoctor}
      />

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        patient={selectedPatient}
      />

      <PrescriptionModal 
        isOpen={isPrescriptionModalOpen} 
        onClose={() => {
          setIsPrescriptionModalOpen(false);
          setEditingPrescription(null);
          setTargetAppointmentId(null);
        }} 
        patient={selectedPatient}
        prescription={editingPrescription}
        appointmentId={targetAppointmentId}
      />
    </div>
  );
}
