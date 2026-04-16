import React from 'react';
import { HeartPulse, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <HeartPulse className="w-8 h-8 text-emerald-500" />
              <span className="text-xl font-bold text-white tracking-tight">MediCare<span className="text-emerald-500">Plus</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Providing world-class healthcare services with a team of expert doctors and state-of-the-art facilities.
            </p>
            <div className="flex gap-4">
              <Facebook className="w-5 h-5 cursor-pointer hover:text-emerald-500 transition-colors" />
              <Twitter className="w-5 h-5 cursor-pointer hover:text-emerald-500 transition-colors" />
              <Instagram className="w-5 h-5 cursor-pointer hover:text-emerald-500 transition-colors" />
              <Linkedin className="w-5 h-5 cursor-pointer hover:text-emerald-500 transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">Our Doctors</li>
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">Departments</li>
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">Contact Us</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Services</h4>
            <ul className="space-y-4 text-sm">
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">Emergency Care</li>
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">Online Booking</li>
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">Medical Reports</li>
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">Pharmacy</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact Info</h4>
            <ul className="space-y-4 text-sm">
              <li>123 Medical Plaza, Health City</li>
              <li>+1 (555) 000-1234</li>
              <li>contact@medicareplus.com</li>
              <li>Mon - Sat: 8:00 AM - 8:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © 2026 MediCare Plus Hospital. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
