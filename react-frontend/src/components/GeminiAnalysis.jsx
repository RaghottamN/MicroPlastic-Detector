import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import ScrollRevealContainer from './ScrollRevealContainer';

// Initialize Groq API
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export default function GeminiAnalysis({ results, image }) {
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [input, setInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [error, setError] = useState(null);
    const [conversationHistory, setConversationHistory] = useState([]);

    // Helper function to call Groq API
    const callGroqAPI = async (messages) => {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL,
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    };

    // Initial Analysis when results change
    useEffect(() => {
        if (!results || !GROQ_API_KEY) return;

        const generateAnalysis = async () => {
            setLoading(true);
            setError(null);
            setAnalysis('');
            setChatHistory([]);
            setConversationHistory([]);

            try {
                const detections = results.detections || [];
                const count = detections.length;
                const avgConf = detections.length
                    ? (detections.reduce((a, b) => a + b.confidence, 0) / detections.length * 100).toFixed(1)
                    : 0;

                const systemPrompt = `You are an expert environmental scientist specializing in microplastics. Provide scientific, well-structured analysis using Markdown formatting.`;

                const userPrompt = `Data provided from an automated detection system:
- Total Particles Detected: ${count}
- Average Detection Confidence: ${avgConf}%

Please provide a dynamic, scientific analysis of this sample.
Include:
1. An assessment of the pollution level (Low/Moderate/High) based on the particle count. (Assume this is a standard sample size).
2. Potential sources of these microplastics.
3. Recommended actions or remediation steps.

Format the output with clear headings.`;

                const messages = [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ];

                const responseText = await callGroqAPI(messages);
                setAnalysis(responseText);

                // Store conversation history for follow-up questions
                setConversationHistory([
                    ...messages,
                    { role: 'assistant', content: responseText }
                ]);

            } catch (err) {
                console.error("Groq Error:", err);
                setError(`Failed to generate analysis. Error: ${err.message || err}`);
            } finally {
                setLoading(false);
            }
        };

        generateAnalysis();
    }, [results]);

    const handleSend = async () => {
        if (!input.trim() || conversationHistory.length === 0) return;

        const userMsg = input;
        setInput('');

        // Optimistically update UI
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatLoading(true);

        try {
            const messages = [
                ...conversationHistory,
                { role: 'user', content: userMsg }
            ];

            const response = await callGroqAPI(messages);
            setChatHistory(prev => [...prev, { role: 'assistant', text: response }]);

            // Update conversation history
            setConversationHistory([
                ...messages,
                { role: 'assistant', content: response }
            ]);
        } catch (err) {
            console.error("Chat Error:", err);
            setChatHistory(prev => [...prev, { role: 'error', text: "Failed to get response." }]);
        } finally {
            setChatLoading(false);
        }
    };

    if (!GROQ_API_KEY) {
        return (
            <div className="glass-card p-6 mt-6">
                <p className="text-yellow-400">Groq API Key is missing. Please add VITE_GROQ_API_KEY to your .env file.</p>
            </div>
        );
    }

    if (!results) return null;

    return (
        <div className="glass-card p-6 mt-6 w-full animate-fade-in">
            <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Environmental Analysis
            </h3>

            {/* Initial Analysis */}
            <div className="mb-6 prose prose-invert max-w-none">
                {loading ? (
                    <div className="flex items-center gap-3 text-gray-400">
                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        Generating expert analysis...
                    </div>
                ) : error ? (
                    <div className="text-red-400 bg-red-500/10 p-4 rounded-lg">
                        {error}
                    </div>
                ) : (
                    <ScrollRevealContainer
                        enableBlur={true}
                        blurStrength={4}
                        baseOpacity={0.1}
                        baseY={20}
                    >
                        <div className="analysis-content">
                            <ReactMarkdown>{analysis}</ReactMarkdown>
                        </div>
                    </ScrollRevealContainer>
                )}
            </div>

            {/* Chat Interface */}
            {!loading && !error && (
                <div className="border-t border-white/10 pt-6">
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                        Ask Follow-up Questions
                    </h4>

                    <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-xl p-4 ${msg.role === 'user'
                                    ? 'bg-gradient-to-r from-primary-600/60 to-purple-600/60 text-white'
                                    : msg.role === 'error'
                                        ? 'bg-red-500/20 text-red-300'
                                        : 'bg-white/5 border border-white/10'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <p className="text-sm">{msg.text}</p>
                                    ) : (
                                        <div className="analysis-content-chat">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 rounded-lg p-3 flex gap-2">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about the results..."
                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || chatLoading}
                            className="p-2 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
