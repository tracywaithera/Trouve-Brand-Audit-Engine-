import React from 'react';
import { motion } from 'motion/react';
import { User as LucideUser, Layers, Briefcase, Clock, LogIn, Sparkles } from 'lucide-react';
import { BrandType } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface HomeProps {
  onSelectType: (type: BrandType) => void;
  onViewHistory?: () => void;
  hasHistory?: boolean;
  user: FirebaseUser | null;
  onLogin: () => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectType, onViewHistory, hasHistory, user, onLogin }) => {
  const scrollToSelection = () => {
    const element = document.getElementById('audit-selection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-6 py-12 md:py-20 text-center"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-12 text-[10px] font-bold tracking-widest uppercase border-2 border-gold rounded-full text-gold">
        <Layers className="w-3 h-3" />
        Brand Audit Engine v2.0
      </div>

      <h1 className="text-4xl md:text-6xl font-serif leading-[1.1] mb-6 tracking-tight">
        Your brand has a <em className="italic text-gold not-italic">gap.</em><br />Let's find it.
      </h1>
      
      <p className="text-lg text-ink-2 max-w-xl mx-auto mb-16 font-medium leading-relaxed">
        Trouve's AI audits your authority, digital footprint, and market positioning. Whether you're a person, a faceless creator, or a business, we identify the growth levers you're missing.
      </p>

      {hasHistory && onViewHistory && (
        <button 
          onClick={onViewHistory}
          className="mb-16 inline-flex items-center gap-2 px-4 py-2 bg-paper-2 border border-ink/5 rounded-full text-[10px] font-bold tracking-widest uppercase text-ink-3 hover:text-ink hover:border-ink/20 transition-all"
        >
          <Clock className="w-3 h-3" />
          View your previous audits
        </button>
      )}

      <div id="audit-selection" className="max-w-4xl mx-auto mb-24">
        <div className="text-[11px] font-bold tracking-widest uppercase text-ink mb-12">
          Select your brand architecture to begin
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button 
            onClick={() => onSelectType('personal')}
            className="group p-8 text-center bg-paper border border-ink/10 rounded-2xl transition-all hover:border-gold-2 hover:bg-gold-l cursor-pointer"
          >
            <div className="flex justify-center mb-4">
              <LucideUser className="w-8 h-8 text-ink group-hover:text-gold transition-colors" />
            </div>
            <div className="text-lg font-serif text-ink mb-2">Personal Brand</div>
            <p className="text-sm text-ink-3 leading-relaxed mb-6">
              You are the core asset. We audit your authority, digital footprint, and professional storytelling.
            </p>
            <div className="w-full py-3 bg-ink text-gold text-[10px] font-bold tracking-widest uppercase rounded-lg group-hover:bg-ink-2 transition-all">
              Start Audit
            </div>
          </button>
          
          <button 
            onClick={() => onSelectType('faceless')}
            className="group p-8 text-center bg-paper border border-ink/10 rounded-2xl transition-all hover:border-gold-2 hover:bg-gold-l cursor-pointer"
          >
            <div className="flex justify-center mb-4">
              <Layers className="w-8 h-8 text-ink group-hover:text-gold transition-colors" />
            </div>
            <div className="text-lg font-serif text-ink mb-2">Faceless Brand</div>
            <p className="text-sm text-ink-3 leading-relaxed mb-6">
              Niche pages and anonymous channels. We audit your consistency, growth levers, and identity signals.
            </p>
            <div className="w-full py-3 bg-ink text-gold text-[10px] font-bold tracking-widest uppercase rounded-lg group-hover:bg-ink-2 transition-all">
              Start Audit
            </div>
          </button>
          
          <button 
            onClick={() => onSelectType('business')}
            className="group p-8 text-center bg-paper border border-ink/10 rounded-2xl transition-all hover:border-gold-2 hover:bg-gold-l cursor-pointer"
          >
            <div className="flex justify-center mb-4">
              <Briefcase className="w-8 h-8 text-ink group-hover:text-gold transition-colors" />
            </div>
            <div className="text-lg font-serif text-ink mb-2">Business Brand</div>
            <p className="text-sm text-ink-3 leading-relaxed mb-6">
              Established companies and teams. We audit market positioning, storytelling, and ad-readiness.
            </p>
            <div className="w-full py-3 bg-ink text-gold text-[10px] font-bold tracking-widest uppercase rounded-lg group-hover:bg-ink-2 transition-all">
              Start Audit
            </div>
          </button>
        </div>

        <div className="bg-ink text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="text-left w-full text-center md:text-left">
            <h3 className="text-xl font-serif text-gold mb-1 text-center md:text-left">Ready to find your brand gap?</h3>
            <p className="text-sm text-white/60">Choose a brand type above to start your free AI audit instantly.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-8 md:gap-12 py-6 border-y border-ink/20">
        <div className="text-center">
          <div className="font-serif text-3xl text-ink">3</div>
          <div className="text-[10px] uppercase tracking-widest text-ink font-bold">Brand types</div>
        </div>
        <div className="text-center">
          <div className="font-serif text-3xl text-ink">6</div>
          <div className="text-[10px] uppercase tracking-widest text-ink font-bold">Audit sections</div>
        </div>
        <div className="text-center">
          <div className="font-serif text-3xl text-ink">PDF</div>
          <div className="text-[10px] uppercase tracking-widest text-ink font-bold">Your report</div>
        </div>
      </div>
    </motion.div>
  );
};
