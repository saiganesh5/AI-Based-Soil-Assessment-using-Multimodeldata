import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import '../styles/chatbot.css';

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

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Focus input when opened
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

        // Build conversation context
        chatHistoryRef.current.push({ role: 'user', text: trimmed });

        try {
            // Build the full prompt with system context and conversation history
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
                className={`chatbot-fab ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(prev => !prev)}
                aria-label="Toggle chatbot"
                id="chatbot-fab"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {/* Chat Window */}
            <div className={`chatbot-window ${isOpen ? 'visible' : ''}`}>
                {/* Header */}
                <div className="chatbot-header">
                    <div className="chatbot-header-info">
                        <div className="chatbot-avatar">🌱</div>
                        <div className="chatbot-header-text">
                            <h4>SoilBot</h4>
                            <span>AI Soil Health Assistant</span>
                        </div>
                    </div>
                    <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chatbot">
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div className="chatbot-messages">
                    <div className="chatbot-welcome">
                        <p>Ask me about soil, crops, fertilizers & more</p>
                    </div>

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chatbot-msg ${msg.role === 'user' ? 'user' : 'bot'}`}>
                            <div className="chatbot-msg-avatar">
                                {msg.role === 'bot' ? '🌱' : '👤'}
                            </div>
                            <div className="chatbot-msg-bubble">
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="chatbot-typing">
                            <div className="chatbot-msg-avatar" style={{ background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                                🌱
                            </div>
                            <div className="chatbot-typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="chatbot-input-bar">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask about soil, crops, fertilizers..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isTyping}
                        id="chatbot-input"
                    />
                    <button
                        className="chatbot-send-btn"
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
