import React from 'react';
import { motion } from 'motion/react';
import { FileText, Trash2, ArrowRight, Clock, Search, TrendingUp } from 'lucide-react';
import { SavedAudit } from '../types';
import { BRAND_LABELS } from '../constants';

interface HistoryProps {
  history: SavedAudit[];
  onView: (audit: SavedAudit) => void;
  onDelete: (id: string) => void;
  onNewAudit: () => void;
  onViewProgress: () => void;
}

export const History: React.FC<HistoryProps> = ({ history, onView, onDelete, onNewAudit, onViewProgress }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredHistory = history.filter(item => 
    item.userData.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.userData.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (history.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-6 py-20 text-center"
      >
        <div className="w-20 h-20 bg-paper-2 rounded-full flex items-center justify-center mx-auto mb-8">
          <FileText className="w-10 h-10 text-ink/20" />
        </div>
        <h2 className="text-3xl font-serif mb-4">No audits found</h2>
        <p className="text-ink-3 mb-10 max-w-md mx-auto">
          You haven't completed any brand audits yet. Start your first audit to see it here.
        </p>
        <button 
          onClick={onNewAudit}
          className="px-8 py-4 bg-ink text-paper text-xs font-bold tracking-widest uppercase rounded hover:bg-ink-2 transition-all"
        >
          Start your first audit
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-6 py-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-ink/10 pb-8">
        <div>
          <h2 className="text-3xl font-serif mb-2">Audit History</h2>
          <p className="text-sm text-ink-3">Manage and review your previous brand intelligence reports.</p>
          {history.length > 1 && (
            <button 
              onClick={onViewProgress}
              className="mt-4 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-gold hover:text-gold-2 transition-colors"
            >
              <TrendingUp className="w-3 h-3" />
              View Brand Progress Dashboard
            </button>
          )}
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
          <input 
            type="text"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-paper-2 border border-ink/10 rounded outline-none focus:border-gold transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredHistory.map((item) => (
          <motion.div 
            key={item.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-paper border border-ink/10 rounded-xl p-5 md:p-6 hover:border-gold/50 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 bg-gold-l text-ink rounded">
                    {BRAND_LABELS[item.userData.brandType]}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-ink-3">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString('en-KE', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
                
                <h3 className="text-xl font-serif text-ink mb-1">{item.userData.brandName}</h3>
                <p className="text-xs text-ink-3">Audit for {item.userData.name}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-serif text-ink leading-none">{item.auditData.overall_score}</div>
                  <div className="text-[8px] uppercase tracking-widest text-ink-3 mt-1">Score</div>
                </div>
                
                <div className="h-10 w-px bg-ink/10" />
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onView(item)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-ink text-paper text-[10px] font-bold tracking-widest uppercase rounded hover:bg-ink-2 transition-all"
                  >
                    View Report
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this audit?')) {
                        onDelete(item.id);
                      }
                    }}
                    className="p-2.5 text-ink-3 hover:text-red-custom hover:bg-red-custom/10 rounded transition-all"
                    title="Delete audit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredHistory.length === 0 && searchTerm && (
          <div className="text-center py-12 bg-paper-2 rounded-xl border border-dashed border-ink/10">
            <p className="text-sm text-ink-3">No audits match your search "{searchTerm}"</p>
          </div>
        )}
      </div>
      
      <div className="mt-12 text-center">
        <button 
          onClick={onNewAudit}
          className="text-xs font-bold text-gold hover:text-gold-2 tracking-widest uppercase underline underline-offset-8 transition-all"
        >
          + Run a new brand audit
        </button>
      </div>
    </motion.div>
  );
};
