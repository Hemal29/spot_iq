import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaUser, FaParking, FaCommentDots } from 'react-icons/fa';
import axios from 'axios';

const QUICK_ACTIONS = [
  'How to book parking?',
  'What are the rates?',
  'Cancel booking?',
  'EV charging?',
  'Peak hours?',
  'Monthly passes?',
];

const WELCOME_MSG = {
  role: 'bot',
  text: `👋 Hey there! I'm **SpotIQ AI** — your parking assistant for Ahmedabad.

I can help you with:
• 📍 Finding parking near you
• 💰 Pricing & payment info
• ❌ Cancellations & refunds
• 📱 QR entry & how it works
• ⚡ EV charging & more

Type your question or tap one below!`,
};

const ChatBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const message = (text || input).trim();
    if (!message || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/chatbot/message`,
        { message }
      );
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: data.data.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: 'Sorry, I had trouble connecting. Please try again or email support@spotiq.in',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl shadow-orange-500/10 flex flex-col overflow-hidden animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-orange-500/10 to-transparent border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <FaRobot className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">SpotIQ AI</h3>
            <p className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Online
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
        >
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px] scrollbar-thin">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-tr-sm'
                  : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-sm'
              }`}
            >
              {msg.role === 'bot' ? (
                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <FaSpinner className="animate-spin" />
                Typing...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              onClick={() => handleSend(action)}
              disabled={loading}
              className="text-[11px] px-2.5 py-1.5 bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/30 text-gray-300 hover:text-orange-400 rounded-lg transition-all disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10 focus-within:border-orange-500/30 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about parking..."
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-white/10 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane className="text-xs" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
