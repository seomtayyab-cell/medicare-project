import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Bot, User, Trash2, AlertTriangle, ChevronRight, Loader2, X } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIAssistantProps {
  onClose?: () => void;
}

export default function AIAssistant({ onClose }: AIAssistantProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: 'model',
      text: "Hello! I'm your MediCare AI Assistant. While I can't replace a real doctor, I can help you understand your symptoms, explain medical terms, or suggest wellness tips. How can I help you today?"
    }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, { role: 'user', text: userMessage }].map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: "You are a professional, empathetic, and knowledgeable MediCare Health AI Assistant. Your goal is to help patients understand health concepts, symptoms, and wellness. CRITICAL: Always include a clear medical disclaimer that you are an AI and not a doctor. If symptoms sound severe (like chest pain, difficulty breathing, or severe injury), strongly urge the patient to visit the emergency room or book an urgent appointment with one of our specialized doctors.",
        }
      });

      const modelResponse = response.text || "I apologize, but I'm having trouble processing that request right now. Please try again or book an appointment with a specialist.";
      setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I'm experiencing a technical issue. Please check your internet connection or try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear conversation history?")) {
      setMessages([
        {
          role: 'model',
          text: "Hello! I'm your MediCare AI Assistant. How can I help you today?"
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-border-main shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold tracking-tight">Health Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Online & Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearChat}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/20"
              title="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 px-6 py-2 border-b border-amber-100 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-[10px] text-amber-800 font-medium">
          Disclaimer: AI information for educational purposes only. Always consult a medical professional for diagnosis.
        </p>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-start gap-3 max-w-[85%]",
                m.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                m.role === 'model' ? "bg-primary text-white" : "bg-white text-text-muted border border-border-main"
              )}>
                {m.role === 'model' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                m.role === 'model' 
                  ? "bg-white border border-border-main text-text-main rounded-tl-none shadow-sm" 
                  : "bg-primary text-white rounded-tr-none shadow-md shadow-primary/10"
              )}>
                {m.text.split('\n').map((line, li) => (
                  <p key={li} className={li > 0 ? "mt-2" : ""}>{line}</p>
                ))}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 bg-white border border-border-main rounded-2xl rounded-tl-none shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-border-main">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'enter' && handleSend()}
            placeholder="Describe your symptoms or ask a health question..."
            className="w-full h-14 pl-6 pr-14 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-text-main"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-primary/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Flu symptoms', 'Healthy diet tips', 'Specialty suggest'].map((tag) => (
            <button
              key={tag}
              onClick={() => setInput(tag)}
              className="px-3 py-1.5 bg-bg-main hover:bg-primary-light hover:text-primary-dark border border-border-main rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
