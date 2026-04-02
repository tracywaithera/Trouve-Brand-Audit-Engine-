import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, Sparkles, Minus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithTrouve } from '../services/gemini';
import { ChatMessage } from '../types';

export const TrouveBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm **Trouve**, your AI brand strategist. How can I help you grow your brand today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithTrouve(newMessages);
      setMessages([...newMessages, { role: 'model', text: response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([...newMessages, { role: 'model', text: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-0 right-4 z-50 pointer-events-none">
      {/* The Hanging Bot */}
      <motion.div
        initial={{ y: -200 }}
        animate={{ 
          y: isOpen ? 450 : 0, 
          rotate: isOpen ? 0 : [ -8, 8, -8 ],
          transition: { 
            y: { 
              type: "spring", 
              stiffness: isOpen ? 40 : 100, // Slower fall when opening
              damping: 15, 
              mass: 1.5 
            },
            rotate: { repeat: Infinity, duration: 6, ease: "easeInOut" } // Slower swing
          }
        }}
        className="pointer-events-auto cursor-pointer flex flex-col items-center"
        onClick={() => !isOpen && setIsOpen(true)}
      >
        {/* The "String" it hangs from */}
        <motion.div 
          animate={{ height: isOpen ? 400 : 120 }}
          transition={{ type: "spring", stiffness: isOpen ? 40 : 100, damping: 15 }}
          className="w-0.5 bg-ink/20 origin-top" 
        />
        
        {/* The Bot Body */}
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.8, transition: { duration: 0.5 } }} // Slow motion tap
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-2 transition-colors duration-700 ${isOpen ? 'bg-gold border-gold text-white' : 'bg-ink border-ink text-gold'}`}
        >
          {isOpen ? <Minus className="w-8 h-8" /> : <Bot className="w-9 h-9" />}
        </motion.div>
        
        {!isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 px-3 py-1 bg-white border border-ink/10 rounded-full shadow-sm text-[10px] font-bold uppercase tracking-widest text-ink whitespace-nowrap"
          >
            Ask Trouve
          </motion.div>
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50, x: 20 }}
            transition={{ type: "spring", stiffness: 50, damping: 20, mass: 1.2 }}
            className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white border border-ink/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="p-4 bg-ink text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase">Trouve AI</div>
                  <div className="text-[10px] text-white/60">Brand Strategist</div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper/30"
            >
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-ink text-white rounded-tr-none' 
                      : 'bg-white border border-ink/5 text-ink rounded-tl-none shadow-sm'
                  }`}>
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-gold">
                      <ReactMarkdown>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-ink/5 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-gold rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-gold rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-gold rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-ink/5 bg-white">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about branding, marketing..."
                  className="w-full pl-4 pr-12 py-3 bg-paper-2 border border-ink/10 rounded-xl outline-none focus:border-gold transition-all text-sm"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-ink text-white rounded-lg hover:bg-ink-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1 text-[9px] text-ink-3 uppercase tracking-widest">
                <Sparkles className="w-2 h-2" />
                Powered by Trouve Intelligence
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
