import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, Sparkles, Minus, Mic, Volume2, Square, Loader2, Trash2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithTrouve, generateTTS } from '../services/gemini';
import { ChatMessage } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, doc, getDocs, writeBatch, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AuditData, UserData } from '../types';

interface TrouveBotProps {
  user: FirebaseUser | null;
  auditData: AuditData | null;
  userData: UserData | null;
}

export const TrouveBot: React.FC<TrouveBotProps> = ({ user, auditData, userData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm **Trouve**, your AI brand strategist. I specialize in **Personal**, **Faceless**, and **Business** brands. How can I help you grow today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Sync with Firestore history if logged in
  useEffect(() => {
    if (!user || !isOpen) return;

    const q = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const historyMessages = snapshot.docs.map(doc => ({
          role: doc.data().role as 'user' | 'model',
          text: doc.data().text
        }));
        // If there's history, use it. Otherwise keep the welcome message.
        setMessages(historyMessages);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chats');
    });

    return unsubscribe;
  }, [user, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: text };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    // Save user message to Firestore
    if (user) {
      try {
        await addDoc(collection(db, 'chats'), {
          userId: user.uid,
          role: 'user',
          text: text,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'chats');
      }
    }

    try {
      const auditContext = (auditData && userData) ? { audit: auditData, user: userData } : undefined;
      const response = await chatWithTrouve(newHistory, auditContext);
      const modelMessage: ChatMessage = { role: 'model', text: response };
      setMessages([...newHistory, modelMessage]);

      // Save model message to Firestore
      if (user) {
        await addDoc(collection(db, 'chats'), {
          userId: user.uid,
          role: 'model',
          text: response,
          timestamp: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = { role: 'model', text: "I'm sorry, I'm having trouble connecting right now. Please try again later." };
      setMessages([...newHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      if (user) {
        try {
          const q = query(collection(db, 'chats'), where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          const batch = writeBatch(db);
          snapshot.docs.forEach(d => batch.delete(d.ref));
          await batch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, 'chats');
        }
      }
      setMessages([{ role: 'model', text: "Hello! Chat cleared. How can I help you today?" }]);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // Stop speaking if active
    if (isSpeaking !== null) {
      audioRef.current?.pause();
      setIsSpeaking(null);
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInput(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert("Microphone access was denied. Please allow microphone permissions in your browser settings to use voice features.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  const speakText = async (text: string, index: number) => {
    if (isSpeaking === index) {
      audioRef.current?.pause();
      setIsSpeaking(null);
      return;
    }

    // Stop listening if active
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setIsSpeaking(index);
    try {
      const base64Audio = await generateTTS(text);
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        audioRef.current.onended = () => setIsSpeaking(null);
      } else {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => setIsSpeaking(null);
      }
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(null);
    }
  };

  return (
    <div className="fixed top-0 right-4 z-50 pointer-events-none">
      {/* ... Bot Hanging Part remains same ... */}
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
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleClearChat}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper/30"
            >
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm relative group ${
                    msg.role === 'user' 
                      ? 'bg-ink text-white rounded-tr-none' 
                      : 'bg-white border border-ink/5 text-ink rounded-tl-none shadow-sm'
                  }`}>
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-gold">
                      <ReactMarkdown>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                    
                    {msg.role === 'model' && (
                      <div className="absolute -right-8 bottom-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => speakText(msg.text, i)}
                          className={`p-1.5 rounded-full bg-white border border-ink/10 text-ink shadow-sm hover:text-gold hover:border-gold ${isSpeaking === i ? 'opacity-100 text-gold border-gold' : ''}`}
                          title="Listen to response"
                        >
                          {isSpeaking === i ? <Square className="w-3 h-3 fill-gold" /> : <Volume2 className="w-3 h-3" />}
                        </button>
                        <button 
                          onClick={() => handleCopy(msg.text, i)}
                          className={`p-1.5 rounded-full bg-white border border-ink/10 text-ink shadow-sm hover:text-gold hover:border-gold ${copiedIndex === i ? 'text-green-500 border-green-500' : ''}`}
                          title="Copy text"
                        >
                          {copiedIndex === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
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
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about branding, marketing..."
                    className="w-full pl-4 pr-10 py-3 bg-paper-2 border border-ink/10 rounded-xl outline-none focus:border-gold transition-all text-sm"
                  />
                  <button 
                    onClick={toggleListen}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isListening ? 'text-red-500 bg-red-100' : 'text-ink-3 hover:text-ink'}`}
                  >
                    {isListening ? (
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Mic className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-ink text-white rounded-xl hover:bg-ink-2 transition-all disabled:opacity-50"
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
