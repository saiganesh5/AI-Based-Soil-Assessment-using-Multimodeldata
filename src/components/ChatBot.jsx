import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `You are "SoilBot", a friendly AI assistant for an AI-Based Soil Health Assessment platform for Indian farmers. You help with:
- Soil types, health, and classification
- Crop recommendations based on soil and climate
- Fertilizer dosages, schedules, and costs
- Irrigation planning and water management
- Crop disease identification and prevention
- Government subsidies and agricultural schemes in India
- Seasonal crop planning (Kharif, Rabi, Zaid)
- Yield prediction and profit estimation

Keep responses concise (2-4 sentences for simple questions, more for detailed ones). Use emojis sparingly. Be warm and helpful. If a question is unrelated to agriculture or soil, politely redirect.`;

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! 🌱 I\'m SoilBot, your soil health assistant. Ask me anything about soil, crops, fertilizers, or farming!' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const chatHistoryRef = useRef([]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 350);
        }
    }, [isOpen]);

    const sendMessage = useCallback(async () => {
        const trimmed = input.trim();
        if (!trimmed || isTyping) return;

        const userMsg = { role: 'user', text: trimmed };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        chatHistoryRef.current.push({ role: 'user', text: trimmed });

        try {
            const historyText = chatHistoryRef.current
                .map(m => `${m.role === 'user' ? 'User' : 'SoilBot'}: ${m.text}`)
                .join('\n');

            const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation so far:\n${historyText}\n\nSoilBot:`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: fullPrompt,
            });

            const botText = response.text || 'I couldn\'t generate a response. Please try again.';

            chatHistoryRef.current.push({ role: 'bot', text: botText });
            setMessages(prev => [...prev, { role: 'bot', text: botText }]);
        } catch (err) {
            console.error('ChatBot error:', err);
            setMessages(prev => [...prev, {
                role: 'bot',
                text: 'Sorry, I\'m having trouble connecting right now. Please check your internet connection and try again. 🔄'
            }]);
        } finally {
            setIsTyping(false);
        }
    }, [input, isTyping]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);

    return (
        <>
            {/* Floating Action Button */}
            <button
                className={`fixed bottom-6 right-6 w-14 h-14 rounded-full text-xl cursor-pointer border-none z-[9999] shadow-xl transition-all duration-300 hover:scale-110 ${isOpen
                        ? 'bg-gray-600 dark:bg-slate-600 text-white rotate-90'
                        : 'bg-gradient-to-br from-emerald-500 to-green-600 text-white animate-fab-pulse'
                    }`}
                onClick={() => setIsOpen(prev => !prev)}
                aria-label="Toggle chatbot"
                id="chatbot-fab"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-24 right-6 w-[380px] max-h-[550px] rounded-2xl shadow-2xl overflow-hidden z-[9998] flex flex-col transition-all duration-300 origin-bottom-right
                bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700
                ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-75 opacity-0 pointer-events-none'}`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🌱</div>
                        <div>
                            <h4 className="text-white text-sm font-bold m-0">SoilBot</h4>
                            <span className="text-emerald-100 text-xs">AI Soil Health Assistant</span>
                        </div>
                    </div>
                    <button className="text-white/80 hover:text-white bg-transparent border-none text-xl cursor-pointer" onClick={() => setIsOpen(false)} aria-label="Close chatbot">
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-900 min-h-[300px]">
                    <div className="text-center py-2">
                        <p className="text-xs text-gray-400 dark:text-slate-500">Ask me about soil, crops, fertilizers & more</p>
                    </div>

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${msg.role === 'bot'
                                    ? 'bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900 dark:to-green-800'
                                    : 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800'
                                }`}>
                                {msg.role === 'bot' ? '🌱' : '👤'}
                            </div>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-br-sm'
                                    : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-sm shadow-sm border border-gray-100 dark:border-slate-600'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-2 items-end">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900 dark:to-green-800 flex items-center justify-center text-sm">
                                🌱
                            </div>
                            <div className="flex gap-1 bg-white dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 dark:border-slate-600">
                                <span className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce-dot" style={{ animationDelay: '0s' }}></span>
                                <span className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce-dot" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce-dot" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask about soil, crops, fertilizers..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isTyping}
                        id="chatbot-input"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500 disabled:opacity-50"
                    />
                    <button
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white border-none cursor-pointer flex items-center justify-center text-lg transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={sendMessage}
                        disabled={!input.trim() || isTyping}
                        aria-label="Send message"
                        id="chatbot-send"
                    >
                        ➤
                    </button>
                </div>
            </div>
        </>
    );
}
