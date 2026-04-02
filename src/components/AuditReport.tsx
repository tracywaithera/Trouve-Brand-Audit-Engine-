import React from 'react';
import { motion } from 'motion/react';
import { Download, RefreshCw, ExternalLink, ArrowLeft } from 'lucide-react';
import { AuditData, UserData } from '../types';
import { BRAND_LABELS } from '../constants';
import { jsPDF } from 'jspdf';

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

  const downloadPDF = async () => {
    if (!data || !userData) {
      setPdfError('No data available to generate PDF.');
      return;
    }

    setIsGenerating(true);
    setPdfError(null);
    
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const W = 210, H = 297, M = 25, CW = W - M * 2;
      let y = M;

      const COLORS = {
        INK: [15, 14, 12],
        GOLD: [184, 147, 74],
        GOLD_LIGHT: [212, 170, 106],
        GRAY: [122, 118, 112],
        PAPER: [250, 249, 246],
        BORDER: [232, 228, 220],
        TEAL: [26, 107, 90],
        TEAL_LIGHT: [240, 248, 246]
      };

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > H - M) {
          doc.addPage();
          y = M + 10;
          return true;
        }
        return false;
      };

      // Header Background
      doc.setFillColor(COLORS.INK[0], COLORS.INK[1], COLORS.INK[2]);
      doc.rect(0, 0, W, 35, 'F');
      
      // Logo & Branding
      try {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                doc.addImage(canvas.toDataURL('image/png'), 'PNG', M, 7, 20, 20);
              }
              resolve();
            } catch (e) {
              resolve();
            }
          };
          img.onerror = () => resolve();
          img.src = 'https://i.ibb.co/Hpn5R6zg/logo-file.png';
          setTimeout(resolve, 3000);
        });
      } catch (e) {}

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(COLORS.GOLD_LIGHT[0], COLORS.GOLD_LIGHT[1], COLORS.GOLD_LIGHT[2]);
      doc.text('TROUVE', M + 25, 16);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 180, 180);
      doc.text('BRAND INTELLIGENCE AUDIT ENGINE', M + 25, 23);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(`REPORT GENERATED: ${new Date().toLocaleDateString('en-KE').toUpperCase()}`, W - M, 20, { align: 'right' });

      y = 55;

      // Title Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
      doc.text(`${BRAND_LABELS[userData.brandType].toUpperCase()} STRATEGIC ANALYSIS`, M, y);
      
      y += 12;
      doc.setFontSize(28);
      doc.setTextColor(COLORS.INK[0], COLORS.INK[1], COLORS.INK[2]);
      const brandNameLines = doc.splitTextToSize(userData.brandName, CW);
      doc.text(brandNameLines, M, y);
      y += brandNameLines.length * 12;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.GRAY[0], COLORS.GRAY[1], COLORS.GRAY[2]);
      doc.text(`Prepared for ${userData.name}`, M, y);
      
      y += 10;
      doc.setDrawColor(COLORS.INK[0], COLORS.INK[1], COLORS.INK[2]);
      doc.setLineWidth(0.8);
      doc.line(M, y, W - M, y);

      y += 20;

      // Executive Summary Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(COLORS.INK[0], COLORS.INK[1], COLORS.INK[2]);
      doc.text('EXECUTIVE SUMMARY', M, y);
      y += 10;

      const summaryLines = doc.splitTextToSize(data.executive_summary, CW - 50);
      const summaryHeight = Math.max(45, summaryLines.length * 7 + 20);
      
      doc.setFillColor(COLORS.PAPER[0], COLORS.PAPER[1], COLORS.PAPER[2]);
      doc.roundedRect(M, y, CW, summaryHeight, 1, 1, 'F');
      
      // Score Circle
      doc.setFillColor(COLORS.INK[0], COLORS.INK[1], COLORS.INK[2]);
      doc.circle(M + 20, y + summaryHeight / 2, 15, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(COLORS.GOLD_LIGHT[0], COLORS.GOLD_LIGHT[1], COLORS.GOLD_LIGHT[2]);
      doc.text(String(data.overall_score), M + 20, y + summaryHeight / 2 + 3, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(COLORS.INK[0], COLORS.INK[1], COLORS.INK[2]);
      doc.text(data.score_label.toUpperCase(), M + 45, y + 14);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setLineHeightFactor(1.6);
      doc.text(summaryLines, M + 45, y + 22);
      
      y += summaryHeight + 30;

      // Audit Sections
      data.sections.forEach((section, i) => {
        const titleText = `${i + 1}. ${section.title.toUpperCase()}`;
        const titleLines = doc.splitTextToSize(titleText, CW - 45);
        const analysisLines = doc.splitTextToSize(section.analysis, CW);
        const insightLines = doc.splitTextToSize(section.finding, CW - 25);
        const actionLines = doc.splitTextToSize(section.action, CW - 25);
        
        const analysisHeight = analysisLines.length * 7;
        const insightHeight = insightLines.length * 7 + 20;
        const actionHeight = actionLines.length * 7 + 20;
        const totalSectionHeight = 20 + titleLines.length * 8 + analysisHeight + insightHeight + actionHeight + 30;

        if (checkPageBreak(totalSectionHeight)) {
          y += 15;
        }

        // Section Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(COLORS.INK[0], COLORS.INK[1], COLORS.INK[2]);
        doc.text(titleLines, M, y);
        
        if (section.rating) {
          doc.setFontSize(11);
          doc.setTextColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
          doc.text(`${section.rating.toUpperCase()} · ${section.score}/100`, W - M, y, { align: 'right' });
        }
        
        y += titleLines.length * 7 + 5;
        doc.setDrawColor(COLORS.BORDER[0], COLORS.BORDER[1], COLORS.BORDER[2]);
        doc.setLineWidth(0.6);
        doc.line(M, y, W - M, y);
        
        y += 15;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11.5);
        doc.setTextColor(COLORS.INK[0], COLORS.INK[1], COLORS.INK[2]);
        doc.setLineHeightFactor(1.7);
        
        analysisLines.forEach((line: string) => {
          if (checkPageBreak(10)) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11.5);
            doc.setTextColor(COLORS.INK[0], COLORS.INK[1], COLORS.INK[2]);
          }
          doc.text(line, M, y);
          y += 7.5;
        });
        
        y += 10;
        
        // Insight Box
        const insightBoxHeight = insightLines.length * 7 + 22;
        checkPageBreak(insightBoxHeight + 15);
        
        doc.setFillColor(COLORS.PAPER[0], COLORS.PAPER[1], COLORS.PAPER[2]);
        doc.rect(M, y, CW, insightBoxHeight, 'F');
        doc.setDrawColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
        doc.setLineWidth(2);
        doc.line(M, y, M, y + insightBoxHeight);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(COLORS.GRAY[0], COLORS.GRAY[1], COLORS.GRAY[2]);
        doc.text('KEY STRATEGIC INSIGHT', M + 10, y + 10);
        
        doc.setFont('helvetica', 'bolditalic');
        doc.setFontSize(12);
        doc.setTextColor(COLORS.INK[0], COLORS.INK[1], COLORS.INK[2]);
        doc.text(insightLines, M + 10, y + 18);
        y += insightBoxHeight + 15;

        // Action Box
        const actionBoxHeight = actionLines.length * 7 + 22;
        checkPageBreak(actionBoxHeight + 15);
        
        doc.setFillColor(COLORS.TEAL_LIGHT[0], COLORS.TEAL_LIGHT[1], COLORS.TEAL_LIGHT[2]);
        doc.rect(M, y, CW, actionBoxHeight, 'F');
        doc.setDrawColor(COLORS.TEAL[0], COLORS.TEAL[1], COLORS.TEAL[2]);
        doc.setLineWidth(2);
        doc.line(M, y, M, y + actionBoxHeight);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(COLORS.TEAL[0], COLORS.TEAL[1], COLORS.TEAL[2]);
        doc.text('STRATEGIC ACTION PLAN', M + 10, y + 10);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(COLORS.INK[0], COLORS.INK[1], COLORS.INK[2]);
        doc.text(actionLines, M + 10, y + 18);
        y += actionBoxHeight + 30;
      });

      // Footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(COLORS.GRAY[0], COLORS.GRAY[1], COLORS.GRAY[2]);
        doc.text(`Trouve AI Brand Audit Engine · Confidential Report · Page ${i} of ${pageCount}`, W / 2, H - 12, { align: 'center' });
      }

      const fileName = `Trouve-Audit-${userData.brandName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}.pdf`;
      doc.save(fileName);
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
          <div className="text-right">
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-ink text-gold-2">
              <span className="font-serif text-xl leading-none">{data.overall_score}</span>
              <span className="text-[7px] uppercase tracking-widest opacity-60">Score</span>
            </div>
            <div className="text-[11px] font-medium text-ink-3 mt-2">{data.score_label}</div>
          </div>
        </div>
      </div>

      <div className="border-l-4 border-ink p-8 mb-10">
        <div className="text-xs font-bold tracking-widest uppercase text-ink mb-3">Executive Summary</div>
        <p className="text-lg leading-relaxed text-ink font-medium">{data.executive_summary}</p>
      </div>

      <div className="space-y-16">
        {data.sections.map((section, index) => (
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
              
              <div className="border-l-4 border-teal p-6 shadow-sm">
                <span className="text-xs font-bold text-teal block mb-2 uppercase tracking-widest">Strategic Action Plan</span>
                <p className="text-base md:text-lg text-ink font-bold leading-snug">{section.action}</p>
              </div>
            </div>
          </div>
        ))}
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
