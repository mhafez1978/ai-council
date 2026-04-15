'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const EXECUTIVES = [
  { id: 'ALL', name: 'All Executives', icon: '👥', title: 'Full Board' },
  { id: 'CEO', name: 'CEO', icon: '👔', title: 'Chief Executive Officer' },
  { id: 'CFO', name: 'CFO', icon: '💰', title: 'Chief Financial Officer' },
  { id: 'CTO', name: 'CTO', icon: '🔧', title: 'Chief Technology Officer' },
  { id: 'CMO', name: 'CMO', icon: '📢', title: 'Chief Marketing Officer' },
  { id: 'COO', name: 'COO', icon: '⚙️', title: 'Chief Operating Officer' },
  { id: 'CLO', name: 'CLO', icon: '⚖️', title: 'Chief Legal Officer' },
  { id: 'INNOVATION', name: 'Innovation', icon: '💡', title: 'Creative Strategist' },
];

export default function DiscussionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [topic, setTopic] = useState('');

  const startDiscussion = () => {
    if (!selected || !topic) return;
    const params = new URLSearchParams({ exec: selected, topic });
    router.push(`/discussion/chat?${params.toString()}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-4">🗣️ Board Discussion</h1>
        <p className="text-gray-600 mt-2">
          Start a live discussion with the executive team
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">1. Select Discussion Type</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Who would you like to speak with?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EXECUTIVES.map((exec) => (
              <button
                key={exec.id}
                onClick={() => setSelected(exec.id)}
                className={`p-4 rounded-lg border-2 flex flex-col items-center text-center transition-all ${
                  selected === exec.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mb-2">{exec.icon}</span>
                <span className="font-medium text-sm">{exec.name}</span>
                <span className="text-xs text-gray-500 mt-1">{exec.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discussion Topic / Question
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={
              selected === 'ALL'
                ? 'What are the pros and cons of launching our new SEO service?'
                : 'Ask your question here...'
            }
          />
        </div>
      </div>

      <button
        onClick={startDiscussion}
        disabled={!selected || !topic}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Start Discussion →
      </button>
    </div>
  );
}