'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  name: string;
  content: string;
}

const EXECUTIVES: Record<string, { name: string; title: string; icon: string }> = {
  ALL: { name: 'Full Board', title: 'All Executives', icon: '👥' },
  CEO: { name: 'CEO', title: 'Chief Executive Officer', icon: '👔' },
  CFO: { name: 'CFO', title: 'Chief Financial Officer', icon: '💰' },
  CTO: { name: 'CTO', title: 'Chief Technology Officer', icon: '🔧' },
  CMO: { name: 'CMO', title: 'Chief Marketing Officer', icon: '📢' },
  COO: { name: 'COO', title: 'Chief Operating Officer', icon: '⚙️' },
  CLO: { name: 'CLO', title: 'Chief Legal Officer', icon: '⚖️' },
  INNOVATION: { name: 'Innovation', title: 'Creative Strategist', icon: '💡' },
};

function PlayButton({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false);

  const speak = () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  };

  return (
    <button onClick={speak} className="ml-2 text-gray-400 hover:text-blue-600">
      {playing ? '⏹️' : '🔊'}
    </button>
  );
}

function MessageContent({ content }: { content: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  if (parts.length === 1) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }
  
  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, i) => 
        urlRegex.test(part) ? (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

function formatSpeakerName(content: string, defaultName: string, execId: string): string {
  if (execId !== 'ALL') return defaultName;
  
  const execNames = ['CFO', 'CTO', 'CMO', 'COO', 'CLO', 'Innovation', 'CEO'];
  for (const name of execNames) {
    if (content.toUpperCase().includes(`[${name}]`)) {
      const titles: Record<string, string> = {
        CFO: 'CFO - Chief Financial Officer',
        CTO: 'CTO - Chief Technology Officer', 
        CMO: 'CMO - Chief Marketing Officer',
        COO: 'COO - Chief Operating Officer',
        CLO: 'CLO - Chief Legal Officer',
        Innovation: 'Innovation - Creative Strategist',
        CEO: 'CEO - Chief Executive Officer',
      };
      return titles[name] || name;
    }
  }
  
  const councilMembers = {
    'Council Member A': 'CFO - Chief Financial Officer',
    'Council Member B': 'CTO - Chief Technology Officer',
    'Council Member C': 'CMO - Chief Marketing Officer',
    'Council Member D': 'COO - Chief Operating Officer',
    'Council Member E': 'CLO - Chief Legal Officer',
    'Council Member F': 'Innovation - Creative Strategist',
    'Council Member G': 'CEO - Chief Executive Officer',
  };
  for (const [key, title] of Object.entries(councilMembers)) {
    if (content.includes(key)) return title;
  }
  
  return defaultName;
}

function ChatContent({ execId, initialTopic }: { execId: string; initialTopic: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [discussionKey, setDiscussionKey] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const exec = EXECUTIVES[execId] || EXECUTIVES.ALL;

  useEffect(() => {
    const key = `discussion-${execId}-${initialTopic.slice(0, 30)}`;
    setDiscussionKey(key);
    const stored = localStorage.getItem(key);
    if (stored) setMessages(JSON.parse(stored));
  }, [execId, initialTopic]);

  useEffect(() => {
    if (discussionKey && messages.length > 0) {
      localStorage.setItem(discussionKey, JSON.stringify(messages));
    }
  }, [messages, discussionKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  useEffect(() => {
    window.speechSynthesis.cancel();
  }, []);

  const buildSystemPrompt = (exec: string, topic: string) => {
    if (exec === 'ALL') {
      return `You are the AI Executive Council. Stay in character. Debate actively. Topic: ${topic}`;
    }
    const execInfo = EXECUTIVES[exec];
    return `You are ${execInfo.name}. Stay in character. Topic: ${topic}`;
  };

  const callAI = async (system: string, userMsg: string) => {
    setLoading(true);
    setStreaming('...');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, user: userMsg }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStreaming('');
      setMessages(prev => [...prev, { role: 'assistant', name: exec.name, content: data.response }]);
    } catch {
      setStreaming('Error getting response');
    } finally {
      setLoading(false);
    }
  };

  const readFileContent = async (file: File): Promise<string> => {
    if (file.type.startsWith('image/')) return `[Image: ${file.name}]`;
    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) return await file.text();
    if (file.name.endsWith('.csv')) {
      const text = await file.text();
      return `[CSV: ${file.name}]\n${text.split('\n').slice(0, 10).join('\n')}`;
    }
    return `[Document: ${file.name}]`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || loading) return;

    const fileInfo = await Promise.all(attachments.map(readFileContent));
    const fileMsg = fileInfo.length > 0 ? `\n\n--- Files ---\n${fileInfo.join('\n')}` : '';
    const userMsg = input + fileMsg;

    setInput('');
    setAttachments([]);
    setMessages(prev => [...prev, { role: 'user', name: 'You', content: input }]);
    callAI(buildSystemPrompt(execId, `${initialTopic} - ${userMsg}`), userMsg);
  };

  const handleSave = async () => {
    if (messages.length === 0) return;
    await fetch('/api/discussions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ execId, topic: initialTopic, messages }),
    });
  };

  return (
    <>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
              <p className="text-xs font-semibold mb-1 opacity-70">
                {msg.role === 'user' ? 'You' : formatSpeakerName(msg.content, exec.name, execId)}
              </p>
              <div className="flex items-start">
                <MessageContent content={msg.content} />
                {msg.role === 'assistant' && <PlayButton text={msg.content} />}
              </div>
            </div>
          </div>
        ))}
        {streaming && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
              <p className="text-xs font-semibold mb-1 opacity-70">Full Board - Executive Council</p>
              <p className="animate-pulse">{streaming}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste contracts, documents for review..."
              disabled={loading}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none min-h-[120px]"
            />
            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded text-sm">
                    <span>{file.name}</span>
                    <button type="button" onClick={() => setAttachments(a => a.filter((_, i) => i !== idx))} className="text-red-500">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.webp,.txt,.md" className="hidden" onChange={(e) => setAttachments([...attachments, ...Array.from(e.target.files || [])])} />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading} className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50">📎</button>
            <button type="submit" disabled={loading || (!input.trim() && attachments.length === 0)} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Send</button>
          </div>
        </div>
      </form>
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const execId = searchParams.get('exec') || 'ALL';
  const initialTopic = searchParams.get('topic') || '';
  const exec = EXECUTIVES[execId] || EXECUTIVES.ALL;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link href="/discussion" className="text-blue-600 hover:underline text-sm">← Back</Link>
          <h1 className="text-2xl font-bold mt-1">{exec.icon} Discussion with {exec.name}</h1>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
        <ChatContent execId={execId} initialTopic={initialTopic} />
      </div>
    </div>
  );
}