import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Menu, X, LogOut, HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import AuthModal from './AuthModal';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const [user] = useAuthState(auth);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  const logout = () => signOut(auth);

  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Departments', id: 'departments' },
    { name: 'Doctors', id: 'doctors' },
  ];

  if (user) {
    navItems.push({ name: 'Dashboard', id: 'dashboard' });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card-bg/80 backdrop-blur-md border-b border-border-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <HeartPulse className="w-8 h-8 text-primary" />
            <span className="text-xl font-extrabold text-text-main tracking-tight">MediCare<span className="text-primary">Plus</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  currentPage === item.id ? "text-primary" : "text-text-muted"
                )}
              >
                {item.name}
              </button>
            ))}
            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}`} alt="Profile" className="w-8 h-8 rounded-full border border-border-main" />
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-primary py-2 text-sm"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-emerald-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"
                >
                  {item.name}
                </button>
              ))}
              {!user && (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-4 bg-primary text-white px-3 py-2 rounded-md text-base font-bold"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </nav>
  );
}
