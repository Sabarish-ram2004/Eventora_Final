import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiRefreshCw } from 'react-icons/fi';
import { RiRobot2Fill, RiSparklingFill } from 'react-icons/ri';
import { chatApi } from '../../services/api';
import { v4 as uuidv4 } from 'uuid';

const sessionId = uuidv4();

const QUICK_PROMPTS = [
  '💍 Plan my wedding',
  '💰 Budget calculator',
  '📸 Best photographers',
  '🏛️ Venue suggestions',
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: '✨ Welcome to **Eventora AI**! I\'m your intelligent event planning assistant.\n\nI can help you:\n• Plan any event\n• Estimate budgets\n• Find perfect vendors\n• Create timelines\n\nWhat event are you planning? 🎊',
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', content: msg, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatApi.send(sessionId, msg);
      const data = res.data.data;
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message,
        cached: data.cached,
        suggestions: data.suggestions,
        time: new Date(),
      }]);
    } catch {
      // Fallback offline response
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I\'m temporarily offline. Please check our vendor listings directly or try again shortly! 🙏',
        time: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ id: 1, role: 'assistant', content: 'Chat cleared! How can I help you plan your event? 🎊', time: new Date() }]);
  };

  const formatContent = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gold-400">$1</strong>')
      .replace(/•/g, '<span class="text-gold-400">•</span>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpen(true)}
              className="chatbot-btn relative w-16 h-16 rounded-full flex items-center justify-center text-royal-blue-950 shadow-gold-glow"
            >
              <RiRobot2Fill size={28} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-royal-blue-950 animate-pulse" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] h-[600px] max-h-[80vh] flex flex-col glass rounded-3xl overflow-hidden shadow-card border border-gold-500/30"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-gradient-to-r from-royal-blue-900/80 to-royal-blue-950/80">
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold-glow">
                <RiRobot2Fill className="text-royal-blue-950" size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">Eventora AI</span>
                  <RiSparklingFill className="text-gold-400 text-xs animate-glow" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs">Online · Smart Assistant</span>
                </div>
              </div>
              <button onClick={clearChat} className="text-white/40 hover:text-white transition-colors p-1">
                <FiRefreshCw size={14} />
              </button>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors p-1">
                <FiX size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center shrink-0 mr-2 mt-1">
                      <RiRobot2Fill className="text-royal-blue-950" size={14} />
                    </div>
                  )}
                  <div className={`max-w-[82%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-gold text-royal-blue-950 font-medium rounded-tr-sm'
                        : 'glass text-white/90 rounded-tl-sm'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                      ) : (
                        msg.content
                      )}
                      {msg.cached && (
                        <span className="text-xs text-white/30 block mt-1">⚡ Instant</span>
                      )}
                    </div>
                    {/* Suggestion chips */}
                    {msg.suggestions && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestions.slice(0, 2).map((s, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(s)}
                            className="text-xs glass px-2.5 py-1 rounded-full text-gold-400 hover:bg-gold-500/10 transition-all border border-gold-500/20"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center">
                    <RiRobot2Fill className="text-royal-blue-950" size={14} />
                  </div>
                  <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-gold-400 rounded-full"
                          animate={{ y: [-4, 4, -4] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none border-t border-white/5">
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p.replace(/^[^\s]+\s/, ''))}
                  className="shrink-0 text-xs glass px-3 py-1.5 rounded-full text-white/60 hover:text-gold-400 hover:border-gold-500/30 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2 glass rounded-xl p-1.5">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about events, vendors, budget..."
                  className="flex-1 bg-transparent text-white text-sm px-2 py-1.5 outline-none placeholder:text-white/30"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="btn-gold rounded-lg p-2.5 disabled:opacity-40"
                >
                  <FiSend size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
