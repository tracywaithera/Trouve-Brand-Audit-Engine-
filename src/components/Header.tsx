import React, { useState } from 'react';
import { Sparkles, History } from 'lucide-react';

interface HeaderProps {
  onHistoryClick?: () => void;
  onEngineClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHistoryClick, onEngineClick }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-paper border-b border-ink/10 md:px-10">
      <div className="flex items-center gap-3">
        {!imgError ? (
          <img 
            src="https://i.ibb.co/Hpn5R6zg/logo-file.png" 
            alt="Trouve" 
            className="w-[38px] h-[38px] object-contain cursor-pointer"
            referrerPolicy="no-referrer"
            onClick={onEngineClick || (() => window.location.reload())}
            onError={() => setImgError(true)}
          />
        ) : (
          <div 
            onClick={onEngineClick || (() => window.location.reload())}
            className="flex items-center justify-center w-[38px] h-[38px] italic font-serif text-xl rounded bg-ink text-gold-2 cursor-pointer"
          >
            T
          </div>
        )}
        <div className="cursor-pointer" onClick={onEngineClick || (() => window.location.reload())}>
          <div className="text-sm font-semibold tracking-widest uppercase text-ink">Trouve</div>
          <div className="text-[10px] tracking-[0.18em] uppercase text-gold font-medium">Brand Intelligence</div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {onHistoryClick && (
          <button 
            onClick={onHistoryClick}
            className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-ink-3 hover:text-ink transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
          </button>
        )}
        <button 
          onClick={onEngineClick}
          className="flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase border rounded-full border-ink/20 text-ink hover:bg-paper-2 hover:border-gold transition-all shadow-sm active:scale-95"
        >
          <Sparkles className="w-3 h-3 text-gold" />
          Brand Audit Engine
        </button>
      </div>
    </header>
  );
};
