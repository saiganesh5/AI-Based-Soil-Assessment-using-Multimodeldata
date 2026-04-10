import { useState, useRef, useEffect, useCallback } from 'react';
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

interface Message {
    role: 'user' | 'bot';
    text: string;
}

export default function ChatBot(): React.JSX.Element {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [showGreeting, setShowGreeting] = useState<boolean>(true);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', text: 'Hello! 🌱 I\'m SoilBot, your soil health assistant. Ask me anything about soil, crops, fertilizers, or farming!' },
        { role: 'bot', text: 'अपनी भाषा चुनें/ Choose your language' }
    ]);
    const [input, setInput] = useState<string>('');
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chatHistoryRef = useRef<Message[]>([]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 350);
            setShowGreeting(false);
        }
    }, [isOpen]);



    const sendMessage = useCallback(async () => {
        const trimmed = input.trim();
        if (!trimmed || isTyping) return;

        const userMsg: Message = { role: 'user', text: trimmed };
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

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);

    // Inline keyframes for wave animation
    const waveKeyframes = `
        @keyframes wave-hand {
            0% { transform: rotate(0deg); }
            10% { transform: rotate(14deg); }
            20% { transform: rotate(-8deg); }
            30% { transform: rotate(14deg); }
            40% { transform: rotate(-4deg); }
            50% { transform: rotate(10deg); }
            60% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
        }
        @keyframes greeting-slide-in {
            0% { opacity: 0; transform: translateX(20px) scale(0.8); }
            100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes greeting-fade-out {
            0% { opacity: 1; transform: translateX(0) scale(1); }
            100% { opacity: 0; transform: translateX(20px) scale(0.8); }
        }
    `;

    return (
        <>
            <style>{waveKeyframes}</style>

            {/* Greeting Bubble */}
            {!isOpen && (
                <div
                    className="fixed bottom-[90px] right-6 z-[9999] flex items-end gap-2 pointer-events-none"
                    style={{
                        animation: showGreeting
                            ? 'greeting-slide-in 0.5s ease-out forwards'
                            : 'greeting-fade-out 0.4s ease-in forwards',
                    }}
                    onAnimationEnd={(e) => {
                        if (e.animationName === 'greeting-fade-out') {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                        }
                    }}
                >
                    <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-br-sm shadow-lg px-4 py-3 max-w-[240px] border border-gray-200 dark:border-slate-600">
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="text-xl"
                                style={{
                                    display: 'inline-block',
                                    animation: 'wave-hand 1.8s ease-in-out 3',
                                    transformOrigin: '70% 70%',
                                }}
                            >
                                👋
                            </span>
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">SoilBot</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-slate-300 m-0 leading-relaxed">
                            कुछ सवाल हैं आपकी मिटटी की बारे में ?<br />
                            మీ మట్టి గురించి మీకు ఏమైనా ప్రశ్నలు ఉన్నాయా?<br />
                            <span className="text-gray-400 dark:text-slate-400">Any queries regarding your soil?</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                className={`fixed bottom-6 right-6 w-14 h-14 rounded-full cursor-pointer border-none z-[9999] shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${isOpen
                    ? 'bg-gray-600 dark:bg-slate-600 text-white rotate-90'
                    : 'bg-gradient-to-br from-emerald-500 to-green-600 text-white animate-fab-pulse'
                    }`}
                onClick={() => setIsOpen(prev => !prev)}
                aria-label="Toggle chatbot"
                id="chatbot-fab"
            >
                {isOpen ? (
                    <span className="text-xl">✕</span>
                ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Bot head */}
                        <rect x="3" y="7" width="18" height="12" rx="3" fill="white" opacity="0.95" />
                        {/* Eyes */}
                        <circle cx="9" cy="13" r="1.8" fill="#16a34a" />
                        <circle cx="15" cy="13" r="1.8" fill="#16a34a" />
                        {/* Eye shine */}
                        <circle cx="9.5" cy="12.5" r="0.5" fill="white" />
                        <circle cx="15.5" cy="12.5" r="0.5" fill="white" />
                        {/* Mouth */}
                        <path d="M9.5 16.5C10.5 17.5 13.5 17.5 14.5 16.5" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" />
                        {/* Antenna */}
                        <line x1="12" y1="7" x2="12" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="12" cy="3" r="1.5" fill="white" opacity="0.9" />
                        {/* Ears / side bits */}
                        <rect x="0.5" y="11" width="2.5" height="4" rx="1" fill="white" opacity="0.8" />
                        <rect x="21" y="11" width="2.5" height="4" rx="1" fill="white" opacity="0.8" />
                    </svg>
                )}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
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
