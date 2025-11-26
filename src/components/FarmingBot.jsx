import { useState } from 'react';
import './FarmingBot.css';

const FarmingBot = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I\'m your farming assistant. I can help you with questions about crops, soil, irrigation, pests, fertilizers, and more. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Using Hugging Face's free inference API
            const response = await fetch(
                "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        inputs: input,
                        parameters: {
                            max_length: 200,
                            temperature: 0.7,
                        }
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            const botResponse = data[0]?.generated_text || "I'm sorry, I couldn't process that. Could you rephrase your question?";

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: botResponse
            }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I apologize, but I\'m having trouble connecting right now. For farming advice, consider:\n\n• Check soil pH regularly (6-7 is ideal for most crops)\n• Water early morning or evening to reduce evaporation\n• Rotate crops to maintain soil health\n• Use organic compost for sustainable farming\n• Monitor weather forecasts for planning\n\nPlease try again later!'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatbot-overlay" onClick={onClose}>
            <div className="chatbot-container" onClick={(e) => e.stopPropagation()}>
                <div className="chatbot-header">
                    <div className="chatbot-title">
                        <span className="bot-icon">🌾</span>
                        <div>
                            <h3>Farming Assistant</h3>
                            <p>AI-powered farming advice</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>

                <div className="chatbot-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <div className="message-content">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message assistant">
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <form className="chatbot-input-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="chatbot-input"
                        placeholder="Ask about farming, crops, pests..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="chatbot-send-btn"
                        disabled={loading || !input.trim()}
                    >
                        {loading ? '...' : '➤'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FarmingBot;
