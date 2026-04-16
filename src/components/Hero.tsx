import React from 'react';
import { motion } from 'motion/react';
import { Calendar, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

export default function Hero({ onBookNow }: { onBookNow: () => void }) {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-bg-main">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-primary-light rounded-full blur-3xl opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary-dark text-xs font-bold uppercase tracking-wider mb-6">
              <ShieldCheck className="w-4 h-4" />
              Trusted Healthcare Provider
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-text-main leading-[1.1] mb-6 tracking-tighter">
              Your Health is Our <span className="text-primary">Top Priority</span>
            </h1>
            <p className="text-lg text-text-muted mb-8 max-w-lg leading-relaxed">
              Experience world-class medical care with our team of expert doctors. 
              Book appointments online, access your medical reports, and manage your health journey with ease.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onBookNow}
                className="btn-primary px-8 py-4 shadow-xl shadow-primary/10 flex items-center gap-2"
              >
                Book Appointment
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 rounded-lg font-bold text-text-main hover:bg-white transition-all border border-border-main">
                View Departments
              </button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-text-main">250+</div>
                <div className="text-sm text-text-muted">Expert Doctors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-text-main">15k+</div>
                <div className="text-sm text-text-muted">Happy Patients</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-text-main">24/7</div>
                <div className="text-sm text-text-muted">Emergency Care</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000"
                alt="Modern Hospital"
                className="w-full h-[500px] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Floating Card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 z-20 bg-card-bg p-6 rounded-2xl shadow-xl border border-border-main max-w-[240px]"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-text-muted">Next Available</div>
                  <div className="text-sm font-bold text-text-main">Today, 2:00 PM</div>
                </div>
              </div>
              <div className="text-xs text-text-muted leading-relaxed">
                Our specialists are ready to assist you anytime.
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
