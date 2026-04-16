import React from 'react';
import { motion } from 'motion/react';
import { Users, Calendar, Settings, Check, X, AlertCircle, TrendingUp } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { Appointment, UserProfile } from '../types';
import { cn } from '../lib/utils';

export default function AdminDashboard() {
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [stats, setStats] = React.useState({ total: 0, pending: 0, confirmed: 0 });

  React.useEffect(() => {
    const qAppts = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const qUsers = query(collection(db, 'users'));

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

    return () => {
      unsubAppts();
      unsubUsers();
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

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Admin Control Panel</h1>
          <p className="text-text-muted">Overview of hospital operations and patient management.</p>
        </div>

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

        <div className="glass-panel overflow-hidden">
          <div className="p-6 border-b border-border-main flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-main">Recent Appointments</h2>
            <button className="text-sm font-bold text-primary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg-main text-text-muted text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Patient UID</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-bg-main transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-main font-mono">{appt.patientUid.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-text-main">{appt.doctorName}</div>
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
                            >
                              <X className="w-4 h-4" />
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
    </div>
  );
}
