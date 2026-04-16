import React from 'react';
import { motion } from 'motion/react';
import { Stethoscope, Brain, Heart, Baby, Bone, Eye, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

const departments = [
  { name: 'Cardiology', icon: Heart, color: 'bg-primary-light text-primary', desc: 'Heart health and cardiovascular care.' },
  { name: 'Neurology', icon: Brain, color: 'bg-primary-light text-primary', desc: 'Brain and nervous system specialists.' },
  { name: 'Pediatrics', icon: Baby, color: 'bg-primary-light text-primary', desc: 'Medical care for infants and children.' },
  { name: 'Orthopedics', icon: Bone, color: 'bg-primary-light text-primary', desc: 'Bone, joint, and muscle treatments.' },
  { name: 'Ophthalmology', icon: Eye, color: 'bg-primary-light text-primary', desc: 'Eye care and vision correction.' },
  { name: 'General Medicine', icon: Stethoscope, color: 'bg-primary-light text-primary', desc: 'Primary care and health checkups.' },
];

export default function Departments() {
  return (
    <section id="departments" className="py-24 bg-bg-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-text-main mb-4 tracking-tight">Our Specialized Departments</h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            We offer a wide range of medical services with state-of-the-art facilities and expert specialists.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept, idx) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-8 hover:border-primary transition-all group"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", dept.color)}>
                <dept.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-3">{dept.name}</h3>
              <p className="text-text-muted leading-relaxed mb-6">{dept.desc}</p>
              <button className="text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                Learn More <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
