import { jsPDF } from 'jspdf';
import { AuditData, UserData } from '../types';
import { BRAND_LABELS } from '../constants';

export const generateAuditPDF = async (data: AuditData, userData: UserData) => {
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

  // Strategic Boards (Included for all users now)
  if (data.brand_canvas && data.business_canvas) {
    // Brand Canvas Page
    doc.addPage();
    y = M;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(COLORS.INK[0], COLORS.INK[1], COLORS.INK[2]);
    doc.text('BRAND STRATEGIC CANVAS', M, y);
    y += 10;
    
    doc.setDrawColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
    doc.setLineWidth(1);
    doc.line(M, y, W - M, y);
    y += 15;

    const drawCanvas = (canvas: any) => {
      const blocks = Object.values(canvas);
      const cols = 2;
      const blockW = (CW - 10) / cols;
      let startX = M;
      let startY = y;
      
      blocks.forEach((block: any, idx: number) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const bx = startX + col * (blockW + 10);
        const by = startY + row * 65;

        doc.setFillColor(COLORS.PAPER[0], COLORS.PAPER[1], COLORS.PAPER[2]);
        doc.roundedRect(bx, by, blockW, 60, 2, 2, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(COLORS.INK[0], COLORS.INK[1], COLORS.INK[2]);
        doc.text(block.title.toUpperCase(), bx + 5, by + 10);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.GRAY[0], COLORS.GRAY[1], COLORS.GRAY[2]);
        block.items.forEach((item: string, i: number) => {
          doc.text(`• ${item}`, bx + 5, by + 18 + i * 5, { maxWidth: blockW - 10 });
        });
      });
      y += (Math.ceil(blocks.length / cols)) * 65 + 10;
    };

    drawCanvas(data.brand_canvas);
    
    // Business Canvas Page
    doc.addPage();
    y = M;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(COLORS.TEAL[0], COLORS.TEAL[1], COLORS.TEAL[2]);
    doc.text('BUSINESS VALUE DASHBOARD', M, y);
    y += 10;
    
    doc.setDrawColor(COLORS.TEAL[0], COLORS.TEAL[1], COLORS.TEAL[2]);
    doc.setLineWidth(1);
    doc.line(M, y, W - M, y);
    y += 15;

    drawCanvas(data.business_canvas);
  }

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
};
