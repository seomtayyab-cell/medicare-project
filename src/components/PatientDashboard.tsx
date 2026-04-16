import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, FileText, Clock, User, Plus, Search, X } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Appointment, Report } from '../types';
import { cn } from '../lib/utils';

export default function PatientDashboard() {
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [reports, setReports] = React.useState<Report[]>([]);
  const [activeTab, setActiveTab] = React.useState<'appointments' | 'reports'>('appointments');

  React.useEffect(() => {
    if (!auth.currentUser) return;

    const qAppts = query(
      collection(db, 'appointments'),
      where('patientUid', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const qReports = query(
      collection(db, 'reports'),
      where('patientUid', '==', auth.currentUser.uid),
      orderBy('date', 'desc')
    );

    const unsubAppts = onSnapshot(qAppts, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => doc.data() as Appointment));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    const unsubReports = onSnapshot(qReports, (snapshot) => {
      setReports(snapshot.docs.map(doc => doc.data() as Report));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
    });

    return () => {
      unsubAppts();
      unsubReports();
    };
  }, [auth.currentUser]);

  const [isUploading, setIsUploading] = React.useState(false);

  const handleUploadReport = async () => {
    if (!auth.currentUser) return;
    setIsUploading(true);
    const path = 'reports';
    try {
      await addDoc(collection(db, path), {
        id: crypto.randomUUID(),
        patientUid: auth.currentUser.uid,
        title: 'New Medical Report',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        date: new Date().toISOString().split('T')[0],
        doctorName: 'General Clinic',
        createdAt: serverTimestamp()
      });
      alert('Report uploaded successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsUploading(false);
    }
  };

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
            <button 
              onClick={handleUploadReport}
              disabled={isUploading}
              className="btn-primary flex items-center gap-2 py-2 text-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> {isUploading ? 'Uploading...' : 'Upload Report'}
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
              onClick={() => setActiveTab('reports')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all",
                activeTab === 'reports' ? "bg-primary-light text-primary border-l-4 border-primary" : "text-text-muted hover:bg-white"
              )}
            >
              <FileText className="w-5 h-5" /> Medical Reports
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
                            <div className="flex items-center gap-3 text-sm text-text-muted mt-1">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {appt.date}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {appt.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                            appt.status === 'confirmed' ? "bg-primary-light text-primary-dark" :
                            appt.status === 'cancelled' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                          )}>
                            {appt.status}
                          </span>
                          <button className="text-text-muted hover:text-red-600">
                            <X className="w-5 h-5" />
                          </button>
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
              ) : (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid sm:grid-cols-2 gap-4"
                >
                  {reports.length > 0 ? (
                    reports.map((report) => (
                      <div key={report.id} className="glass-panel p-6 hover:border-primary transition-all group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <span className="text-xs font-bold text-text-muted">{report.date}</span>
                        </div>
                        <h3 className="font-bold text-text-main mb-1 group-hover:text-primary transition-colors">{report.title}</h3>
                        <p className="text-sm text-text-muted mb-4">Issued by {report.doctorName || 'General Clinic'}</p>
                        <button className="w-full py-2 rounded-lg bg-primary-light text-primary-dark text-sm font-bold hover:bg-primary hover:text-white transition-all">
                          Download Report
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full glass-panel p-12 text-center border-dashed">
                      <FileText className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-text-main mb-1">No reports found</h3>
                      <p className="text-text-muted">Your medical reports will appear here once available.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
