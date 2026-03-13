import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiSend, FiMinimize2 } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'
import { chatbotAPI } from '../../services/api'

const QUICK_PROMPTS = [
  'Plan a wedding', 'Estimate my budget', 'Find halls in Mumbai', 'Best catering services'
]

export default function AIChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "👋 Hi! I'm **Eventora AI**. I can help you plan events, find vendors, and estimate budgets. What are you planning today? 🎉" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const userMsg = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      const res = await chatbotAPI.chat({ message: msg, history })
      setMessages(prev => [...prev, { role: 'assistant', content: res.response, cached: res.cached }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again! 🔄"
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const renderMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-gold">$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-brand-purple to-brand-gold flex items-center justify-center shadow-2xl animate-pulse-gold hover:scale-110 transition-transform"
          >
            <HiSparkles className="w-8 h-8 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[400px] h-[560px] flex flex-col glass-dark rounded-3xl shadow-2xl overflow-hidden border border-brand-gold/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-gradient-to-r from-brand-purple/30 to-brand-navy-light">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-gold to-brand-purple flex items-center justify-center animate-float">
                  <HiSparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white text-sm">Eventora AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-gray-400 font-body">Always online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-gold to-brand-purple flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <HiSparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-body leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-brand-purple to-brand-navy-light text-white rounded-tr-none'
                      : 'glass text-gray-200 rounded-tl-none'
                  }`}>
                    <span dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }} />
                    {msg.cached && <span className="text-xs text-gray-500 ml-2">⚡cached</span>}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-gold to-brand-purple flex items-center justify-center">
                    <HiSparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="glass rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-brand-gold animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap">
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => sendMessage(p)}
                    className="text-xs px-3 py-1.5 rounded-full glass-gold text-brand-gold hover:bg-brand-gold/20 transition-all font-body border border-brand-gold/20">
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-white/5">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask me anything about events..."
                  rows={1}
                  className="flex-1 input-glass rounded-2xl px-4 py-3 text-sm font-body resize-none min-h-[44px] max-h-[100px]"
                  style={{ height: 'auto' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl btn-gold flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
