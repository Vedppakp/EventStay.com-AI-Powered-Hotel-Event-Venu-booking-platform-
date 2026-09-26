import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, X, Send, RotateCcw, ArrowRight, ExternalLink } from 'lucide-react';
import { aiAPI } from '../services/api';

// Helper to format bot responses with bolding, bullets, and linebreaks
function renderFormattedMessage(text) {
  if (!text) return null;

  const lines = text.split('\n');
  return lines.map((line, lIdx) => {
    if (line.trim() === '') {
      return <div key={lIdx} className="h-2" />;
    }

    // Parse **bold** and *italic*
    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return (
      <div key={lIdx} className="min-h-[1.3em] leading-relaxed">
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return (
              <em key={pIdx} className="italic text-slate-700">
                {part.slice(1, -1)}
              </em>
            );
          }
          return part;
        })}
      </div>
    );
  });
}

export default function AIChatbotWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Hello! I'm your **EventStay AI Assistant**.\n\nAsk me anything about:\n• 🏨 Venue prices & capacities\n• 🛏️ Guest room calculations\n• 🍽️ Catering menus & ₹/plate rates\n• 🎟️ Active discount promo codes\n• ❓ How to book a package"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState([
    'How to book a venue',
    'Cheapest venue in Janakpur',
    'How many rooms for 50 guests?',
    'Active discount coupons'
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: messageText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(messageText);
      if (res.success) {
        setMessages([...newMessages, { sender: 'bot', text: res.reply }]);
        if (res.quickSuggestions?.length > 0) {
          setQuickSuggestions(res.quickSuggestions);
        }
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'bot',
          text: "I'm having trouble connecting right now, but feel free to explore our venues or build a custom event package!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: "👋 Chat reset! How can I assist with your wedding or event plans today?"
      }
    ]);
    setQuickSuggestions([
      'How to book a venue',
      'Cheapest venue in Janakpur',
      'How many rooms for 50 guests?',
      'Active discount coupons'
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Expanded Chat Window */}
      {isOpen ? (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-80 sm:w-96 h-[500px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  EventStay AI Concierge
                </h4>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Inventory
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-md'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.sender === 'bot' ? renderFormattedMessage(m.text) : m.text}

                  {/* Contextual Action Buttons in Bot Message */}
                  {m.sender === 'bot' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.text.includes('Package Builder') && (
                        <button
                          onClick={() => navigate('/planner')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 transition-colors"
                        >
                          🛠️ Open Package Builder <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {(m.text.includes('Explore') || m.text.includes('venues') || m.text.includes('Heritage Grand') || m.text.includes('Mithila Palace')) && (
                        <button
                          onClick={() => navigate('/explore')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                        >
                          🏨 Explore All Venues <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {m.text.includes('WELCOME5000') && (
                        <button
                          onClick={() => navigate('/checkout')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          🎟️ Go to Checkout <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-slate-400">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex gap-1.5 shadow-sm">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Horizontal Scroll */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickSuggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 transition-colors border border-slate-200 shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about venues, rooms, catering, coupons..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Button Trigger */
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-700 via-indigo-600 to-brand-600 text-white font-bold rounded-full shadow-xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span className="text-xs font-extrabold hidden sm:inline">Event AI Assistant</span>
        </button>
      )}
    </div>
  );
}

