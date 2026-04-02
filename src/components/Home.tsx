import React from 'react';
import { motion } from 'motion/react';
import { User, Layers, Briefcase, Clock } from 'lucide-react';
import { BrandType } from '../types';

interface HomeProps {
  onSelectType: (type: BrandType) => void;
  onViewHistory?: () => void;
  hasHistory?: boolean;
}

export const Home: React.FC<HomeProps> = ({ onSelectType, onViewHistory, hasHistory }) => {
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
      <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-[10px] font-bold tracking-widest uppercase border-2 border-gold rounded-full text-gold cursor-pointer hover:bg-gold hover:text-white transition-all active:scale-95" onClick={scrollToSelection}>
        <Layers className="w-3 h-3" />
        Brand Audit Engine v2.0
      </div>

      <h1 className="text-4xl md:text-6xl font-serif leading-[1.1] mb-6 tracking-tight">
        Your brand has a <em className="italic text-gold not-italic">gap.</em><br />Let's find it.
      </h1>
      
      <p className="text-lg text-ink max-w-xl mx-auto mb-12 font-medium leading-relaxed">
        Trouve's AI checks your brand and tells you how to improve. Whether you're a person, a faceless page, or a business, we've got you covered.
      </p>

      {hasHistory && onViewHistory && (
        <button 
          onClick={onViewHistory}
          className="mb-12 inline-flex items-center gap-2 px-4 py-2 bg-paper-2 border border-ink/5 rounded-full text-[10px] font-bold tracking-widest uppercase text-ink-3 hover:text-ink hover:border-ink/20 transition-all"
        >
          <Clock className="w-3 h-3" />
          View your previous audits
        </button>
      )}
      
      <div className="flex justify-center gap-8 md:gap-12 mb-16 py-6 border-y border-ink/20">
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
      
      <div id="audit-selection" className="max-w-2xl mx-auto scroll-mt-24">
        <div className="text-[11px] font-bold tracking-widest uppercase text-ink mb-6">
          What kind of brand are you auditing?
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => onSelectType('personal')}
            className="group p-6 text-center bg-paper border border-ink/10 rounded-xl transition-all hover:border-gold-2 hover:bg-gold-l cursor-pointer"
          >
            <div className="flex justify-center mb-3">
              <User className="w-6 h-6 text-ink group-hover:text-gold" />
            </div>
            <div className="text-sm font-semibold text-ink mb-1">Personal brand</div>
            <div className="text-[11px] text-ink-3 leading-relaxed">
              You are the brand. Coaches, creators, executives.
            </div>
          </button>
          
          <button 
            onClick={() => onSelectType('faceless')}
            className="group p-6 text-center bg-paper border border-ink/10 rounded-xl transition-all hover:border-gold-2 hover:bg-gold-l cursor-pointer"
          >
            <div className="flex justify-center mb-3">
              <Layers className="w-6 h-6 text-ink group-hover:text-gold" />
            </div>
            <div className="text-sm font-semibold text-ink mb-1">Faceless brand</div>
            <div className="text-[11px] text-ink-3 leading-relaxed">
              No visible founder. Niche pages, anonymous brands.
            </div>
          </button>
          
          <button 
            onClick={() => onSelectType('business')}
            className="group p-6 text-center bg-paper border border-ink/10 rounded-xl transition-all hover:border-gold-2 hover:bg-gold-l cursor-pointer"
          >
            <div className="flex justify-center mb-3">
              <Briefcase className="w-6 h-6 text-ink group-hover:text-gold" />
            </div>
            <div className="text-sm font-semibold text-ink mb-1">Business brand</div>
            <div className="text-[11px] text-ink-3 leading-relaxed">
              Company, startup, or established brand with a team.
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
