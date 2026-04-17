import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = React.useState<'login' | 'signup'>(initialMode);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    displayName: ''
  });

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setFormData({ email: '', password: '', displayName: '' });
    }
  }, [isOpen, initialMode]);

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
          role: (result.user.email === 'seomtayyab@gmail.com' || result.user.email === 'adminmedicare@gmail.com') ? 'admin' : 'patient',
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
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_32px_120px_-10px_rgba(0,0,0,0.3)] border border-slate-100 p-8 sm:p-12 my-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-all duration-300 z-30 border border-transparent hover:border-slate-100 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              {mode === 'login' ? 'Sign in to access your dashboard' : 'Join MediCare Plus today'}
            </p>
          </div>

          <div className="relative">
            <form key={mode} onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Field Group: Name (Signup only) */}
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-1.5 transition-all overflow-hidden"
                  >
                    <label htmlFor="fullname" className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                      <User className="w-4 h-4 text-primary" /> 
                      <span>Full Name</span>
                    </label>
                    <input
                      id="fullname"
                      required
                      type="text"
                      autoComplete="name"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="Enter your name"
                      className="block w-full h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary focus:bg-white outline-none transition-all text-slate-900 font-medium"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Field Group: Email (Always visible) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>Email Address</span>
                </label>
                <input
                  id="email"
                  required
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="block w-full h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary focus:bg-white outline-none transition-all text-slate-900 font-medium"
                />
              </div>

              {/* Field Group: Password (Always visible) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-bold text-slate-700 flex items-center gap-2 px-1">
                  <Lock className="w-4 h-4 text-primary" />
                  <span>Password</span>
                </label>
                <input
                  id="password"
                  required
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Type your password"
                  className="block w-full h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary focus:bg-white outline-none transition-all text-slate-900 font-medium"
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-100 rounded-lg text-[11px] text-red-600 font-bold leading-tight"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 btn-primary mt-2 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    <span className="text-base">{mode === 'login' ? 'Sign In to Account' : 'Create New Account'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

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
