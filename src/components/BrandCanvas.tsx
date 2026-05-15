import React from 'react';
import { motion } from 'motion/react';
import { BrandCanvas as BrandCanvasType, BusinessCanvas as BusinessCanvasType, CanvasBlock } from '../types';
import { LayoutGrid, Palette, Target, Zap, Users, CreditCard, Activity, DollarSign, Megaphone } from 'lucide-react';

interface BrandCanvasProps {
  brandCanvas: BrandCanvasType;
  businessCanvas: BusinessCanvasType;
}

const Block: React.FC<{ block: CanvasBlock; icon: React.ReactNode; color: string }> = ({ block, icon, color }) => (
  <div className="bg-white border border-ink/5 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink mb-2">{block.title}</h4>
    <ul className="space-y-1.5">
      {block?.items?.map((item, i) => (
        <li key={i} className="text-xs text-ink/70 flex gap-2">
          <span className="text-gold mt-1">•</span>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export const BrandCanvas: React.FC<BrandCanvasProps> = ({ brandCanvas, businessCanvas }) => {
  return (
    <div className="space-y-16">
      {/* Brand Strategic Canvas */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-serif text-ink">Brand Strategic Canvas</h3>
            <p className="text-xs text-ink-3 uppercase tracking-widest">Foundational Brand Identity & Positioning</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Block 
            block={brandCanvas.purpose} 
            icon={<Target className="w-4 h-4 text-white" />} 
            color="bg-ink" 
          />
          <Block 
            block={brandCanvas.identity} 
            icon={<Users className="w-4 h-4 text-white" />} 
            color="bg-ink" 
          />
          <Block 
            block={brandCanvas.tone} 
            icon={<Megaphone className="w-4 h-4 text-white" />} 
            color="bg-ink" 
          />
          <Block 
            block={brandCanvas.visuals} 
            icon={<Palette className="w-4 h-4 text-white" />} 
            color="bg-ink" 
          />
          <Block 
            block={brandCanvas.positioning} 
            icon={<Zap className="w-4 h-4 text-white" />} 
            color="bg-ink" 
          />
          <Block 
            block={brandCanvas.promise} 
            icon={<Target className="w-4 h-4 text-white" />} 
            color="bg-ink" 
          />
        </div>
      </section>

      {/* Business Model Narrative */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-serif text-ink">Business Value Dashboard</h3>
            <p className="text-xs text-ink-3 uppercase tracking-widest">Commercial Viability & Market Mechanics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Block 
            block={businessCanvas.valueProps} 
            icon={<Zap className="w-4 h-4 text-white" />} 
            color="bg-teal" 
          />
          <Block 
            block={businessCanvas.customerSegments} 
            icon={<Users className="w-4 h-4 text-white" />} 
            color="bg-teal" 
          />
          <Block 
            block={businessCanvas.channels} 
            icon={<Megaphone className="w-4 h-4 text-white" />} 
            color="bg-teal" 
          />
          <Block 
            block={businessCanvas.revenueStreams} 
            icon={<DollarSign className="w-4 h-4 text-white" />} 
            color="bg-teal" 
          />
          <Block 
            block={businessCanvas.keyActivities} 
            icon={<Activity className="w-4 h-4 text-white" />} 
            color="bg-teal" 
          />
          <Block 
            block={businessCanvas.costStructure} 
            icon={<CreditCard className="w-4 h-4 text-white" />} 
            color="bg-teal" 
          />
        </div>
      </section>

      <div className="p-8 bg-paper-2 rounded-2xl border border-ink/5 text-center">
        <p className="text-sm text-ink font-serif mb-2">Strategic Insight</p>
        <p className="text-xs text-ink-3 leading-relaxed max-w-2xl mx-auto">
          This board integrates your brand identity with your business mechanics. 
          Use it as a North Star for all marketing and operational decisions.
        </p>
      </div>
    </div>
  );
};
