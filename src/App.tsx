/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { LogIn } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Departments from './components/Departments';
import Doctors from './components/Doctors';
import AppointmentModal from './components/AppointmentModal';
import PatientDashboard from './components/PatientDashboard';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import { Doctor, UserProfile } from './types';

const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    bio: 'Expert in interventional cardiology with over 15 years of experience.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=400',
    department: 'Cardiology'
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Neurologist',
    bio: 'Specializes in neurodegenerative diseases and brain health.',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    department: 'Neurology'
  },
  {
    id: '3',
    name: 'Dr. Emily Williams',
    specialty: 'Pediatrician',
    bio: 'Dedicated to providing compassionate care for children of all ages.',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400',
    department: 'Pediatrics'
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialty: 'Orthopedic Surgeon',
    bio: 'Specialist in joint replacement and sports medicine.',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    department: 'Orthopedics'
  }
];

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = React.useState('home');
  const [selectedDoctor, setSelectedDoctor] = React.useState<Doctor | null>(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const path = `users/${user.uid}`;
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // Create profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'User',
              role: (user.email === 'seomtayyab@gmail.com' || user.email === 'adminmedicare@gmail.com') ? 'admin' : 'patient',
              photoURL: user.photoURL || undefined
            };
            await setDoc(docRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, path);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchProfile();
  }, [user]);

  React.useEffect(() => {
    const initDoctors = async () => {
      if (userProfile?.role !== 'admin') return;
      
      const path = 'doctors';
      try {
        const doctorsSnap = await getDocs(collection(db, 'doctors'));
        if (doctorsSnap.empty) {
          const batch = writeBatch(db);
          MOCK_DOCTORS.forEach((docData) => {
            const docRef = doc(collection(db, 'doctors'), docData.id);
            batch.set(docRef, docData);
          });
          await batch.commit();
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    };

    initDoctors();
  }, [userProfile]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBook = (doctor: Doctor) => {
    if (!user) {
      alert('Please sign in to book an appointment.');
      return;
    }
    setSelectedDoctor(doctor);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      
      <main className="pt-16">
        {currentPage === 'home' && (
          <>
            <Hero onBookNow={() => handleNavigate('doctors')} />
            <Departments />
            <Doctors onBook={handleBook} />
          </>
        )}

        {currentPage === 'departments' && <Departments />}
        
        {currentPage === 'doctors' && <Doctors onBook={handleBook} />}

        {currentPage === 'dashboard' && (
          userProfile ? (
            userProfile.role === 'admin' ? <AdminDashboard /> : <PatientDashboard />
          ) : (
            <div className="flex flex-col items-center justify-start min-h-[80vh] text-center px-4 pt-20">
              <div className="bg-card-bg p-8 rounded-2xl border border-border-main shadow-xl max-w-md w-full">
                <LogIn className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text-main mb-2">Access Restricted</h2>
                <p className="text-text-muted mb-6">Please sign in to your account to view your personalized medical dashboard and reports.</p>
                <button 
                  onClick={() => {
                    const nav = document.querySelector('nav');
                    const signinBtn = nav?.querySelector('#nav-signin-btn') || nav?.querySelector('#mobile-signin-btn');
                    const signupBtn = nav?.querySelector('#nav-signup-btn') || nav?.querySelector('#mobile-signup-btn');
                    (signinBtn as HTMLButtonElement || signupBtn as HTMLButtonElement)?.click();
                  }}
                  className="btn-primary w-full py-3"
                >
                  Sign In Now
                </button>
              </div>
            </div>
          )
        )}
      </main>

      <Footer />

      <AppointmentModal 
        doctor={selectedDoctor} 
        onClose={() => setSelectedDoctor(null)} 
      />
    </div>
  );
}

