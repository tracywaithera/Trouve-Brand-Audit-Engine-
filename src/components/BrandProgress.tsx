import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SavedAudit } from '../types';
import { ArrowLeft, TrendingUp, Calendar, Download, RefreshCw } from 'lucide-react';
import { generateAuditPDF } from '../services/pdfService';

interface BrandProgressProps {
  history: SavedAudit[];
  onBack: () => void;
}

export const BrandProgress: React.FC<BrandProgressProps> = ({ history, onBack }) => {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadLatest = async () => {
    if (history.length === 0) return;
    setIsDownloading(true);
    try {
      await generateAuditPDF(history[0].auditData, history[0].userData);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const data = (history || [])
    .slice()
    .reverse()
    .map(audit => ({
      date: new Date(audit.timestamp).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }),
      score: audit?.auditData?.overall_score || 0,
      brandName: audit?.userData?.brandName || 'Unknown'
    }));

  const latestScore = history[0]?.auditData?.overall_score || 0;
  const previousScore = history[1]?.auditData?.overall_score || 0;
  const diff = latestScore - previousScore;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-6 py-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs text-ink-3 hover:text-ink mb-4 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to history
          </button>
          <h2 className="text-3xl font-serif">Brand Progress Dashboard</h2>
          <p className="text-sm text-ink-3">Tracking your strategic evolution over time</p>
        </div>
        
        <div className="bg-paper-2 border border-ink/10 rounded-2xl p-6 flex items-center gap-6">
          <button 
            onClick={handleDownloadLatest}
            disabled={isDownloading}
            className="p-3 bg-white border border-ink/10 rounded-full text-ink hover:bg-gold hover:text-white transition-all disabled:opacity-50"
            title="Download Latest Audit PDF"
          >
            {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-3">Latest Score</span>
            <span className="text-3xl font-serif text-ink">{latestScore}</span>
          </div>
          {history.length > 1 && (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-3">Growth</span>
              <span className={`text-xl font-bold flex items-center gap-1 ${diff >= 0 ? 'text-teal' : 'text-red-custom'}`}>
                {diff >= 0 ? '+' : ''}{diff}
                <TrendingUp className={`w-4 h-4 ${diff < 0 ? 'rotate-180' : ''}`} />
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white border border-ink/10 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold tracking-widest uppercase text-ink">Score Trajectory</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-ink-3">
              <Calendar className="w-3 h-3" />
              Last {history.length} Audits
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B8934A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#B8934A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E4DC" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#7A7670', fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#7A7670', fontWeight: 'bold' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F0E0C', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#F9F8F6',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  itemStyle={{ color: '#D4AA6A' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#B8934A" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Card */}
        <div className="bg-ink rounded-2xl p-8 text-white">
          <h3 className="text-xs font-bold tracking-widest uppercase text-gold-2 mb-6">Strategic Insights</h3>
          <div className="space-y-6">
            <div className="border-l-2 border-gold-2/30 pl-4 py-1">
              <p className="text-xs text-white/60 mb-1 uppercase tracking-widest">Consistency</p>
              <p className="text-sm font-medium leading-relaxed">
                {diff > 0 
                  ? "Your brand authority is trending upward. The strategic adjustments are working." 
                  : diff < 0 
                  ? "We've seen a slight dip. This usually happens when moving into a new niche or scaling." 
                  : "Your positioning is stable. It might be time for a bold move to break the plateau."}
              </p>
            </div>
            
            <div className="border-l-2 border-gold-2/30 pl-4 py-1">
              <p className="text-xs text-white/60 mb-1 uppercase tracking-widest">Next Milestone</p>
              <p className="text-sm font-medium leading-relaxed">
                Targeting a score of **{Math.min(100, latestScore + 10)}** by refining your visibility strategy.
              </p>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full py-4 bg-gold text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-gold-2 transition-all"
              >
                Run New Audit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History List (Simplified) */}
      <div className="mt-12">
        <h3 className="text-sm font-bold tracking-widest uppercase text-ink mb-6">Audit Log</h3>
        <div className="space-y-4">
          {(history || []).map((audit, i) => (
            <div key={audit.id} className="bg-white border border-ink/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-paper-2 flex items-center justify-center text-xs font-bold text-ink">
                  {history.length - i}
                </div>
                <div>
                  <div className="text-sm font-bold text-ink">{audit?.userData?.brandName}</div>
                  <div className="text-[10px] text-ink-3 uppercase tracking-widest">
                    {new Date(audit.timestamp).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs font-bold text-ink">{audit?.auditData?.overall_score}/100</div>
                  <div className="text-[9px] text-ink-3 uppercase tracking-widest">{audit?.auditData?.score_label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
