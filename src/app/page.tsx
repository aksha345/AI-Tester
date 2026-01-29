"use client";

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Bot, User, Sparkles, Copy, Check, Info } from 'lucide-react';

// --- Types ---
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// --- Components ---
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-400"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "# Welcome to AutoTestGen\n\nI'm ready to generate your test cases. Please describe your feature or paste your code snippet below.",
      timestamp: Date.now(),
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage.content, model: 'llama3.2' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error: ${response.statusText}`);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "No response generated.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Generation failed', error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `### ❌ Error\n${error.message}\n\n*Please ensure Ollama is running and Llama 3.2 is pulled.*`,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <Sparkles className="text-white" size={18} />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-white">AutoTestGen</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          <span className="px-2 py-1 bg-zinc-900 rounded border border-zinc-800">Model: llama3.2</span>
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Ollama Online</span>
          </div>
        </div>
      </header>

      {/* Message List */}
      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-5">
              <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded flex items-center justify-center ${msg.role === 'assistant' ? 'bg-zinc-800 text-indigo-400' : 'bg-indigo-600 text-white'}`}>
                {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className="flex-1 space-y-2 overflow-hidden">
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  {msg.role === 'assistant' ? 'Assistant' : 'You'}
                </div>
                <div className="prose prose-invert prose-zinc max-w-none leading-relaxed text-zinc-300">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <div className="my-4 rounded-md overflow-hidden bg-black/50 border border-zinc-800 shadow-lg">
                            <div className="px-4 py-2 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">{match[1]}</span>
                              <CopyButton text={String(children).replace(/\n$/, '')} />
                            </div>
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent' }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-sm" {...props}>
                            {children}
                          </code>
                        );
                      },
                      table({ children }) {
                        return <div className="my-6 overflow-x-auto rounded-md border border-zinc-800 shadow-md"><table className="w-full text-left border-collapse table-auto">{children}</table></div>;
                      },
                      thead({ children }) { return <thead className="bg-zinc-900 text-zinc-400">{children}</thead>; },
                      th({ children }) { return <th className="p-3 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-800 whitespace-nowrap">{children}</th>; },
                      td({ children }) { return <td className="p-3 text-sm border-b border-zinc-800/50 whitespace-normal break-words min-w-[120px]">{children}</td>; },

                      h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-4 border-b border-zinc-900 pb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-semibold text-zinc-100 mt-4">{children}</h2>
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex gap-5 animate-pulse">
              <div className="flex-shrink-0 w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-600">
                <Sparkles size={18} />
              </div>
              <div className="flex-1 pt-2 space-y-3">
                <div className="h-2 w-24 bg-zinc-800 rounded"></div>
                <div className="h-2 w-full bg-zinc-900 rounded"></div>
                <div className="h-2 w-3/4 bg-zinc-900 rounded"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="p-6 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Briefly describe a feature or paste code..."
              className="w-full bg-zinc-900 text-zinc-100 rounded-lg pl-4 pr-14 py-4 focus:ring-1 focus:ring-indigo-500 focus:outline-none border-0 min-h-[56px] max-h-48 resize-none shadow-sm placeholder:text-zinc-600"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className="absolute right-3 w-8 h-8 flex items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-600 font-medium px-1 uppercase tracking-widest">
            <div className="flex gap-4 italic font-bold">
              <span className="flex items-center gap-1"><Info size={10} /> Shift+Enter for newline</span>
            </div>
            <span>Build 1.0.4 • Local Inference</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
