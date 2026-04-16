import React from 'react';
import { motion } from 'motion/react';
import { Star, Calendar, MessageSquare } from 'lucide-react';
import { Doctor } from '../types';

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

interface DoctorsProps {
  onBook: (doctor: Doctor) => void;
}

export default function Doctors({ onBook }: DoctorsProps) {
  return (
    <section id="doctors" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-text-main mb-4 tracking-tight">Meet Our Expert Doctors</h2>
            <p className="text-text-muted max-w-xl">
              Our team consists of highly qualified and experienced medical professionals dedicated to your well-being.
            </p>
          </div>
          <button className="text-primary font-bold hover:underline">View All Doctors</button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {MOCK_DOCTORS.map((doctor, idx) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel overflow-hidden group hover:border-primary transition-all"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-text-main">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  4.9
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{doctor.specialty}</div>
                <h3 className="text-lg font-bold text-text-main mb-2">{doctor.name}</h3>
                <p className="text-sm text-text-muted line-clamp-2 mb-6">{doctor.bio}</p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onBook(doctor)}
                    className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Now
                  </button>
                  <button className="w-10 h-10 border border-border-main rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-all">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
