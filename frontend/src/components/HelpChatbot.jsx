import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, HelpCircle } from 'lucide-react';

export default function HelpChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your EngageAI Multi-Agent assistant. How can I help you navigate the system today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const suggestions = [
    "How to signup as Student?",
    "How to approve a Teacher?",
    "How plagiarism checks work?",
    "Help Guide?"
  ];

  const getAIResponse = (input) => {
    const text = input.toLowerCase();
    
    // Rule 1: Credentials
    if (text.includes('admin') || text.includes('password') || text.includes('credential')) {
      return "🛡️ Secure Administrator Access:\n• For security compliance, Administrator credentials are NOT disclosed publicly by this support chatbot.\n• Please reference your secure local database configuration or contact your system administrator for access permissions.";
    }
    
    // Rule 2: Online Meetings step-by-step
    if (text.includes('meeting') || text.includes('meet') || text.includes('live')) {
      return "Where to find Online Meetings:\n1. Please log in to your account.\n2. Go to the Student Portal (or Teacher Dashboard).\n3. Click on 'Online Meets' in the navigation menu.\n4. You will see your scheduled active classes there!";
    }

    // Rule 3: General project features
    if (text.includes('student') || text.includes('signup') || text.includes('roll')) {
      return "🎓 Student Registration Steps:\n1. Click 'Create an account' at the bottom of the login card.\n2. Choose 'Student' as the role.\n3. Fill in your Name, Email, and Password.\n4. Click register and log in instantly.";
    }
    if (text.includes('teacher') || text.includes('approve') || text.includes('reject') || text.includes('pending')) {
      return "👨‍🏫 Teacher Approval Process:\n• Teachers can register freely but start in a 'Pending Verification' state.\n• To approve them: Log in as Admin, find the teacher in the 'Teacher Approval Queue', and click 'Approve'.";
    }
    if (text.includes('plagiarism') || text.includes('similarity') || text.includes('grade')) {
      return "📝 Plagiarism & Grading System:\n• Students upload text-based homework.\n• The backend runs a custom cosine-similarity engine comparing it against previous submissions.\n• Teachers can review the similarity percentage and enter grades.";
    }

    // Rule 4: Strict off-topic rejection
    return "Please ask questions only related to the application.";
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });
      const data = await res.json();
      
      const responseText = data.response || getAIResponse(textToSend);
      
      const newBotMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newBotMessage]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Error: Unable to reach the AI assistant backend.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat toggle button */}
      {!isOpen && (
        <div className="relative group">
          {/* Floating Robot Icon above the button */}
          <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-slate-900 border border-brand-500/30 text-brand-400 rounded-xl p-1.5 shadow-lg animate-bounce flex items-center justify-center pointer-events-none">
            <Bot className="h-4.5 w-4.5" />
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-brand-600 hover:bg-brand-500 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center relative"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="absolute right-14 bg-slate-900 text-slate-200 border border-white/10 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Questions? Chat with AI helper
            </span>
          </button>
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="w-[360px] h-[500px] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-slate-950 px-4 py-3 flex justify-between items-center border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="bg-brand-500/10 p-1.5 rounded-lg">
                <Bot className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">EngageAI Assistant</h3>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  AI Agent Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`p-2 rounded-lg h-fit ${
                  msg.sender === 'user' ? 'bg-brand-500/10 text-brand-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className="max-w-[75%] space-y-1">
                  <div className={`text-xs p-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 block px-1">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2.5">
                <div className="p-2 bg-slate-800 text-slate-400 rounded-lg h-fit">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none border border-white/5 px-4 py-2.5 text-xs flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-4 py-2 border-t border-white/5 bg-slate-950/20 flex gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sug)}
                className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 rounded-full px-3 py-1 text-[10px] font-semibold transition-all"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 border-t border-white/5 bg-slate-950 flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Ask a question..."
              className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl p-2.5 transition-all flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
