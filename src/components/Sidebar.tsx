'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DecisionSummary {
  id: string;
  objective: string;
  decision: string;
  createdAt: string;
}

interface ActiveDiscussion {
  id: string;
  execId: string;
  topic: string;
  startedAt: string;
}

function RecentDiscussions({ currentPath }: { currentPath: string }) {
  const [discussions, setDiscussions] = useState<{ key: string; execId: string; topic: string; lastActive: string }[]>([]);

  useEffect(() => {
    const updateList = () => {
      const items: { key: string; execId: string; topic: string; lastActive: string }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('discussion-')) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const msgs = JSON.parse(data);
              if (msgs.length > 0) {
                items.push({
                  key,
                  execId: key.split('-')[1] || 'ALL',
                  topic: msgs[0]?.content?.slice(0, 40) || 'Untitled',
                  lastActive: msgs[msgs.length - 1]?.timestamp || '',
                });
              }
            } catch {}
          }
        }
      }
      items.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
      setDiscussions(items.slice(0, 10));
    };
    
    updateList();
    const interval = setInterval(updateList, 2000);
    window.addEventListener('focus', updateList);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', updateList);
    };
  }, []);

  if (discussions.length === 0) return <p className="text-sm text-slate-500">No discussions yet</p>;

  return (
    <div className="space-y-2">
      {discussions.map((d) => (
        <Link
          key={d.key}
          href={`/discussion/chat?exec=${d.execId}&topic=${encodeURIComponent(d.topic)}`}
          className={`block py-2 px-3 rounded text-sm hover:bg-slate-800 transition-colors ${
            currentPath.includes('chat') && d.topic.includes(d.topic.slice(0, 20)) ? 'bg-slate-800 border-l-2 border-blue-500' : ''
          }`}
        >
          <p className="truncate font-medium">{d.topic}</p>
          <p className="text-xs text-slate-400 mt-1">
            {d.execId} · {new Date(d.lastActive).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        </Link>
      ))}
    </div>
  );
}

function ArchivedDiscussions() {
  const [archived, setArchived] = useState<{ id: string; execId: string; topic: string; createdAt: string }[]>([]);

  useEffect(() => {
    fetch('/api/discussions')
      .then(res => res.json())
      .then(data => setArchived(data))
      .catch(console.error);
  }, []);

  if (archived.length === 0) return <p className="text-sm text-slate-500">No archived discussions</p>;

  return (
    <div className="space-y-2">
      {archived.map((d) => (
        <Link
          key={d.id}
          href={`/discussion/chat?exec=${d.execId}&topic=${encodeURIComponent(d.topic)}`}
          className="block py-2 px-3 rounded text-sm hover:bg-slate-800 transition-colors"
        >
          <p className="truncate font-medium">{d.topic}</p>
          <p className="text-xs text-slate-400 mt-1">
            {d.execId} · {new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </Link>
      ))}
    </div>
  );
}

export default function Sidebar() {
  const [archives, setArchives] = useState<DecisionSummary[]>([]);
  const [activeDiscussion, setActiveDiscussion] = useState<ActiveDiscussion | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/decisions')
      .then((res) => res.json())
      .then((data) => setArchives(data.slice(0, 10)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('active-discussion');
    if (stored) {
      setActiveDiscussion(JSON.parse(stored));
    }
    
    const handleStorage = () => {
      const s = localStorage.getItem('active-discussion');
      setActiveDiscussion(s ? JSON.parse(s) : null);
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleStorage);
    };
  }, []);

  return (
    <aside className="w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col h-screen">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold">AI Executive Council</h1>
        <p className="text-xs text-slate-400 mt-1">Blooming Brands + Nodes</p>
      </div>
      
      <nav className="mt-4 px-4 space-y-1">
        <Link
          href="/dashboard"
          className={`block py-2.5 px-4 rounded transition-colors ${
            pathname === '/dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'
          }`}
        >
          📊 Dashboard
        </Link>
        <Link
          href="/new"
          className={`block py-2.5 px-4 rounded transition-colors ${
            pathname === '/new' ? 'bg-blue-600' : 'hover:bg-slate-800'
          }`}
        >
          ✨ New Decision
        </Link>
        <Link
          href="/discussion"
          className={`block py-2.5 px-4 rounded transition-colors ${
            pathname.startsWith('/discussion') ? 'bg-blue-600' : 'hover:bg-slate-800'
          }`}
        >
          🗣️ Discussion
        </Link>
        <Link
          href="/autonomous"
          className={`block py-2.5 px-4 rounded transition-colors ${
            pathname.startsWith('/autonomous') ? 'bg-blue-600' : 'hover:bg-slate-800'
          }`}
        >
          🤖 Autonomous Ops
        </Link>
        <Link
          href="/scoreboard"
          className={`block py-2.5 px-4 rounded transition-colors ${
            pathname === '/scoreboard' ? 'bg-blue-600' : 'hover:bg-slate-800'
          }`}
        >
          🏆 Scoreboard
        </Link>
        <Link
          href="/clock"
          className={`block py-2.5 px-4 rounded transition-colors ${
            pathname === '/clock' ? 'bg-blue-600' : 'hover:bg-slate-800'
          }`}
        >
          ⏰ Time Clock
        </Link>
        <Link
          href="/hr"
          className={`block py-2.5 px-4 rounded transition-colors ${
            pathname === '/hr' ? 'bg-blue-600' : 'hover:bg-slate-800'
          }`}
        >
          👥 HR Department
        </Link>
        <Link
          href="/daily"
          className={`block py-2.5 px-4 rounded transition-colors ${
            pathname === '/daily' ? 'bg-blue-600' : 'hover:bg-slate-800'
          }`}
        >
          📝 Daily Activities
        </Link>
      </nav>

      {activeDiscussion && (
        <div className="mt-6 px-4">
          <h2 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">
            🔴 Active Discussion
          </h2>
          <Link
            href={`/discussion/chat?exec=${activeDiscussion.execId}&topic=${encodeURIComponent(activeDiscussion.topic)}`}
            className={`block py-2 px-3 rounded text-sm hover:bg-slate-800 transition-colors bg-green-900/50 border-l-2 border-green-500 ${
              pathname.startsWith('/discussion/chat') ? 'bg-slate-800' : ''
            }`}
          >
            <p className="truncate font-medium">{activeDiscussion.topic}</p>
            <p className="text-xs text-green-400 mt-1">
              {activeDiscussion.execId} • Active now
            </p>
          </Link>
        </div>
      )}

      <div className="mt-6 px-4 flex-1 overflow-auto">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          💬 Recent Discussions
        </h2>
        <RecentDiscussions currentPath={pathname} />
      </div>

      <div className="mt-4 px-4 flex-1 overflow-auto">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          💾 Archived 1-on-1
        </h2>
        <ArchivedDiscussions />
      </div>

      <div className="mt-4 px-4 flex-1 overflow-auto">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          📁 Archives
        </h2>
        <div className="space-y-2">
          {archives.map((item) => (
            <Link
              key={item.id}
              href={`/decision/${item.id}`}
              className={`block py-2 px-3 rounded text-sm hover:bg-slate-800 transition-colors ${
                pathname === `/decision/${item.id}` ? 'bg-slate-800 border-l-2 border-blue-500' : ''
              }`}
            >
              <p className="truncate font-medium">{item.objective}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
                {' • '}
                {item.decision || 'Pending'}
              </p>
            </Link>
          ))}
          {archives.length === 0 && (
            <p className="text-sm text-slate-500">No decisions yet</p>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-slate-800">
        <div className="text-xs text-slate-400">
          <p>Operating Mode: SURVIVAL</p>
          <p className="mt-1">Cash: $1,000</p>
        </div>
      </div>
    </aside>
  );
}