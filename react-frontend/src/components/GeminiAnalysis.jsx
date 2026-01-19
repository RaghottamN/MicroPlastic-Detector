import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';



// Initialize Gemini
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;



export default function GeminiAnalysis({ results, image }) {
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [input, setInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [error, setError] = useState(null);
    const [chatSession, setChatSession] = useState(null);



    // Initial Analysis when results change
    useEffect(() => {
        if (!results || !genAI) return;



        const generateAnalysis = async () => {
            setLoading(true);
            setError(null);
            setAnalysis('');
            setChatHistory([]);



            try {
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });



                const detections = results.detections || [];
                const count = detections.length;
                const avgConf = detections.length
                    ? (detections.reduce((a, b) => a + b.confidence, 0) / detections.length * 100).toFixed(1)
                    : 0;



                const prompt = `
                    You are an expert environmental scientist specializing in microplastics.
                    
                    Data provided from an automated detection system:
                    - Total Particles Detected: ${count}
                    - Average Detection Confidence: ${avgConf}%
                    
                    Please provide a dynamic, scientific analysis of this sample.
                    Include:
                    1. An assessment of the pollution level (Low/Moderate/High) based on the particle count. (Assume this is a standard sample size).
                    2. Potential sources of these microplastics.
                    3. Recommended actions or remediation steps.
                    
                    Format the output with clear headings. Use Markdown formatting.
                `;



                // 1. Generate initial analysis
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                setAnalysis(responseText);



                // 2. Initialize chat session with history so it knows the context
                const session = model.startChat({
                    history: [
                        {
                            role: "user",
                            parts: [{ text: prompt }],
                        },
                        {
                            role: "model",
                            parts: [{ text: responseText }],
                        }
                    ],
                });
                setChatSession(session);



            } catch (err) {
                console.error("Gemini Error:", err);
                setError("Failed to generate analysis. Please check your API key.");
            } finally {
                setLoading(false);
            }
        };



        generateAnalysis();
    }, [results]);



    const handleSend = async () => {
        if (!input.trim() || !chatSession) return;



        const userMsg = input;
        setInput('');



        // Optimistically update UI
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatLoading(true);



        try {
            const result = await chatSession.sendMessage(userMsg);
            const response = result.response.text();
            setChatHistory(prev => [...prev, { role: 'model', text: response }]);
        } catch (err) {
            console.error("Chat Error:", err);
            // Remove the user message if failed? Or just show error.
            setChatHistory(prev => [...prev, { role: 'error', text: "Failed to get response." }]);
        } finally {
            setChatLoading(false);
        }
    };



    if (!API_KEY) {
        return (
            <div className="glass-card p-6 mt-6">
                <p className="text-yellow-400">Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.</p>
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
                    <div className="whitespace-pre-wrap text-gray-200 leading-relaxed font-light">
                        {analysis}
                    </div>
                )}
            </div>



            {/* Chat Interface */}
            {!loading && !error && (
                <div className="border-t border-white/10 pt-6">
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                        Ask Follow-up Questions
                    </h4>



                    <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                                    ? 'bg-primary-600/50 text-white'
                                    : msg.role === 'error'
                                        ? 'bg-red-500/20 text-red-300'
                                        : 'bg-white/5 text-gray-300'
                                    }`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
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
