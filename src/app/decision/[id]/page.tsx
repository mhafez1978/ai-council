'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface AgentSection {
  name: string;
  fullTitle: string;
  content: string;
}

interface DecisionDetail {
  id: string;
  objective: string;
  budget: string;
  timeline: string;
  riskTolerance: string;
  mode: string;
  context: string;
  fullResponse: string;
  decisionJson: string;
  createdAt: string;
}

const AGENT_TITLES: Record<string, string> = {
  'CFO': 'Chief Financial Officer',
  'CTO': 'Chief Technology Officer',
  'CMO': 'Chief Marketing Officer',
  'COO': 'Chief Operating Officer',
  'CLO': 'Chief Legal Officer',
  'INNOVATION': 'Creative Strategist',
  'CEO': 'Chief Executive Officer',
};

function parseSections(response: string): AgentSection[] {
  const sections: AgentSection[] = [];
  const sectionHeaders = [
    '🧠 EXECUTIVE OPINIONS',
    '### ⚔️ DEBATE ROUND',
    '### 🧾 REVISED POSITIONS',
    '### 👔 CEO FINAL DECISION',
    '### ✅ ACTION PLAN',
    '### 📊 DECISION SUMMARY',
  ];
  
  const agentNames = ['CFO', 'CTO', 'CMO', 'COO', 'CLO', 'INNOVATION'];
  
  agentNames.forEach((agent) => {
    const regex = new RegExp(`\\[${agent}[^\\]]*\\]([\\s\\S]*?)(?=\\n\\[|$)`, 'i');
    const match = response.match(regex);
    if (match) {
      sections.push({
        name: agent,
        fullTitle: AGENT_TITLES[agent] || agent,
        content: match[1].trim(),
      });
    }
  });
  
  const debateMatch = response.match(/### ⚔️ DEBATE ROUND([\s\S]*?)(?=###|$)/);
  if (debateMatch) {
    sections.push({
      name: 'DEBATE',
      fullTitle: 'Executive Debate',
      content: debateMatch[1].trim(),
    });
  }
  
  const ceoMatch = response.match(/### 👔 CEO FINAL DECISION([\s\S]*?)(?=###|$)/);
  if (ceoMatch) {
    sections.push({
      name: 'CEO',
      fullTitle: 'Chief Executive Officer - Final Decision',
      content: ceoMatch[1].trim(),
    });
  }
  
  return sections;
}

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
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  };

  return (
    <button
      onClick={speak}
      className={`ml-2 p-2 rounded-full transition-colors ${
        playing 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
      }`}
      title={playing ? 'Stop' : 'Read aloud'}
    >
      {playing ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}

export default function DecisionDetailPage() {
  const params = useParams();
  const [decision, setDecision] = useState<DecisionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<AgentSection[]>([]);

  useEffect(() => {
    if (!params.id) return;
    
    fetch(`/api/decision/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setDecision(data);
        setSections(parseSections(data.fullResponse));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Decision not found</p>
        <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{decision.objective}</h1>
            <div className="flex gap-3 mt-3 flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {decision.mode}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                {decision.riskTolerance} risk
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                {decision.budget}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                {decision.timeline}
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Context</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{decision.context}</p>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {section.name} - {section.fullTitle}
              </h2>
              <PlayButton text={`${section.name} says: ${section.content}`} />
            </div>
            <div className="prose max-w-none whitespace-pre-wrap text-gray-700 text-sm">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Full Response</h2>
          <PlayButton text={decision.fullResponse} />
        </div>
        <pre className="whitespace-pre-wrap text-sm font-mono text-gray-600">
          {decision.fullResponse}
        </pre>
      </div>
    </div>
  );
}