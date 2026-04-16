import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, LogIn, UserPlus, Chrome } from 'lucide-react';
import { auth, googleProvider, db } from '../firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    displayName: ''
  });

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: result.user.email === 'seomtayyab@gmail.com' ? 'admin' : 'patient',
          photoURL: result.user.photoURL
        });
      }
      onClose();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(result.user, { displayName: formData.displayName });
        
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: formData.displayName,
          role: result.user.email === 'seomtayyab@gmail.com' ? 'admin' : 'patient',
        });
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          className="relative bg-card-bg w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border-main p-8"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-bg-main rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-text-main tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-text-muted mt-1">
              {mode === 'login' ? 'Sign in to access your dashboard' : 'Join MediCare Plus today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" /> Full Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="John Doe"
                  className="input-field w-full"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="input-field w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4" /> Password
              </label>
              <input
                required
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="input-field w-full"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />
              )}
              {mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-main"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card-bg px-2 text-text-muted font-bold">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-border-main py-3 rounded-lg text-sm font-bold text-text-main hover:bg-slate-50 transition-all"
          >
            <Chrome className="w-5 h-5 text-primary" />
            Google Account
          </button>

          <div className="mt-8 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm font-bold text-primary hover:underline"
            >
              {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
