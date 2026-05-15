import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, RefreshCw, ExternalLink, ArrowLeft, FileDown, Volume2, Square, Copy } from 'lucide-react';
import { AuditData, UserData } from '../types';
import { BRAND_LABELS } from '../constants';
import { generateAuditPDF } from '../services/pdfService';
import { generateTTS } from '../services/gemini';
import { BrandCanvas } from './BrandCanvas';

interface AuditReportProps {
  data: AuditData;
  userData: UserData;
  onReset: () => void;
  onBackToEdit: () => void;
  onBackToHistory?: () => void;
}

export const AuditReport: React.FC<AuditReportProps> = ({ data, userData, onReset, onBackToEdit, onBackToHistory }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [pdfError, setPdfError] = React.useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const toggleSpeak = async () => {
    if (isSpeaking) {
      audioRef.current?.pause();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      const base64Audio = await generateTTS(data.executive_summary);
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        audioRef.current.onended = () => setIsSpeaking(false);
      } else {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => setIsSpeaking(false);
      }
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
    }
  };

  const downloadPDF = async () => {
    if (!data || !userData) {
      setPdfError('No data available to generate PDF.');
      return;
    }

    setIsGenerating(true);
    setPdfError(null);
    
    try {
      await generateAuditPDF(data, userData);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      setPdfError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-6 py-12"
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 border-b-2 border-ink pb-8">
        <div>
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-gold mb-1">
            {BRAND_LABELS[userData.brandType]}
          </div>
          <h2 className="text-3xl md:text-4xl font-serif leading-tight mb-2">{userData.brandName} — Brand Audit</h2>
          <p className="text-sm text-ink-3">Prepared by Trouve AI · {new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        
        <div className="flex items-center gap-4 self-end md:self-auto">
          <button 
            onClick={downloadPDF}
            disabled={isGenerating}
            className="p-3 bg-paper-2 border border-ink/10 rounded-full text-ink hover:bg-gold hover:text-white transition-all disabled:opacity-50"
            title="Download PDF"
          >
            {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
          </button>
          <div className="text-right">
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-ink text-gold-2">
              <span className="font-serif text-xl leading-none">{data.overall_score}</span>
              <span className="text-[7px] uppercase tracking-widest opacity-60">Score</span>
            </div>
            <div className="text-[11px] font-medium text-ink-3 mt-2">{data.score_label}</div>
          </div>
        </div>
      </div>

      <div className="border-l-4 border-ink p-8 mb-10 relative group bg-paper/20">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold tracking-widest uppercase text-ink">Executive Summary</div>
          <button 
            onClick={toggleSpeak}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[10px] font-bold tracking-widest uppercase shadow-sm ${isSpeaking ? 'bg-gold border-gold text-white' : 'bg-white border-ink/10 text-ink hover:border-gold hover:text-gold'}`}
          >
            {isSpeaking ? (
              <>
                <Square className="w-3 h-3 fill-white" />
                Stop Listening
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3" />
                Listen to Summary
              </>
            )}
          </button>
        </div>
        <p className="text-lg leading-relaxed text-ink font-medium">{data.executive_summary}</p>
      </div>

      <div className="space-y-16">
        {data.sections?.map((section, index) => (
          <div key={index} className="group">
            <div className="flex items-center justify-between border-b-2 border-ink/20 pb-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-ink text-xs font-bold text-ink">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="text-sm font-bold tracking-widest uppercase text-ink">{section.title}</h3>
              </div>
              {section.rating && (
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                  section.rating === 'High' ? 'bg-teal-l text-teal' : 
                  section.rating === 'Medium' ? 'bg-gold-l text-ink' : 
                  'bg-red-custom/10 text-red-custom'
                }`}>
                  {section.rating} · {section.score}/100
                </div>
              )}
            </div>
            
            <div className="space-y-8">
              <p className="text-base md:text-lg leading-relaxed text-ink font-medium">{section.analysis}</p>
              
              <div className="border-l-4 border-gold p-6 shadow-sm">
                <span className="text-xs font-bold text-ink block mb-2 uppercase tracking-widest">Key Strategic Insight</span>
                <p className="text-base md:text-lg text-ink italic font-bold leading-snug">{section.finding}</p>
              </div>
              
              <div className="border-l-4 border-teal p-6 shadow-sm relative group/btn">
                <span className="text-xs font-bold text-teal block mb-2 uppercase tracking-widest">Strategic Action Plan</span>
                <p className="text-base md:text-lg text-ink font-bold leading-snug">{section.action}</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(section.action);
                    alert('Action plan copied to clipboard!');
                  }}
                  className="absolute top-4 right-4 p-2 bg-white border border-ink/10 rounded-lg text-teal opacity-0 group-hover/btn:opacity-100 transition-all hover:bg-teal-l shadow-sm"
                  title="Copy action plan"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Canvases Control (Now visible to everyone) */}
      <div className="mt-24 pt-16 border-t-2 border-ink">
        {data.brand_canvas && data.business_canvas && (
          <BrandCanvas 
            brandCanvas={data.brand_canvas} 
            businessCanvas={data.business_canvas} 
          />
        )}
      </div>

      <div className="mt-16 bg-ink rounded-2xl p-10 text-center">
        <h3 className="text-2xl font-serif text-gold-2 mb-3">Ready to close the gap?</h3>
        <p className="text-sm text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
          Book a 60-minute strategy session with Tracy Waithera. We'll build a 90-day execution plan around your exact audit findings.
        </p>
        <a 
          href="https://calendly.com/trouve" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-white text-xs font-bold tracking-widest uppercase rounded hover:bg-gold-2 transition-all"
        >
          Book strategy session — KES 15,000
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-ink/10">
        <div className="flex-1 flex flex-col gap-2">
          <button 
            onClick={downloadPDF}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gold text-white text-xs font-bold tracking-widest uppercase rounded hover:bg-gold-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF report
              </>
            )}
          </button>
          {pdfError && (
            <p className="text-[10px] text-red-custom font-bold text-center">{pdfError}</p>
          )}
        </div>
        <button 
          onClick={onBackToEdit}
          className="flex-1 flex items-center justify-center gap-2 py-4 border border-ink/10 text-ink text-xs font-bold tracking-widest uppercase rounded hover:bg-paper-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to edit
        </button>
        <button 
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 py-4 border border-ink/10 text-ink text-xs font-bold tracking-widest uppercase rounded hover:bg-paper-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Run another audit
        </button>
        {onBackToHistory && (
          <button 
            onClick={onBackToHistory}
            className="flex-1 flex items-center justify-center gap-2 py-4 border border-ink/10 text-ink text-xs font-bold tracking-widest uppercase rounded hover:bg-paper-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to history
          </button>
        )}
      </div>
    </motion.div>
  );
};
