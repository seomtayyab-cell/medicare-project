export type UserRole = 'patient' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  department: string;
}

export interface Appointment {
  id: string;
  patientUid: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'prescription-issued';
  notes?: string;
}

export interface Prescription {
  id: string;
  patientUid: string;
  doctorName: string;
  date: string;
  medicine: string;
  instructions: string;
  status: 'active' | 'completed' | 'checked';
  createdAt: any;
  appointmentId?: string;
}
