import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Loader2 } from 'lucide-react';
import { BrandType } from '../types';
import { AUDIT_STEPS } from '../constants';

interface AuditProgressProps {
  brandType: BrandType;
  brandName: string;
  onCancel?: () => void;
}

export const AuditProgress: React.FC<AuditProgressProps> = ({ brandType, brandName, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = AUDIT_STEPS[brandType];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <h2 className="text-3xl font-serif mb-3">Analysing <span className="text-gold">{brandName}</span>…</h2>
      <p className="text-sm text-ink-2 mb-8">Our AI is conducting a full strategic review. This usually takes 30–60 seconds.</p>
      
      {onCancel && (
        <button 
          onClick={onCancel}
          className="text-xs text-ink-3 hover:text-ink mb-12 underline underline-offset-4"
        >
          Cancel and go back
        </button>
      )}
      
      <div className="w-full h-1 bg-paper-3 rounded-full mb-10 overflow-hidden">
        <motion.div 
          className="h-full bg-gold"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="space-y-3 text-left">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;
          
          return (
            <div 
              key={index}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-500 ${
                isActive ? 'border-gold bg-gold-l text-ink' : 
                isDone ? 'border-teal-l bg-teal-l text-teal' : 
                'border-ink/10 bg-paper text-ink-3'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] flex-shrink-0 ${
                isActive ? 'border-gold animate-spin-custom' : 
                isDone ? 'border-teal bg-teal text-white' : 
                'border-ink/20'
              }`}>
                {isDone ? <Check className="w-3 h-3" /> : index + 1}
              </div>
              <span className="text-sm">{step}</span>
              {isActive && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
