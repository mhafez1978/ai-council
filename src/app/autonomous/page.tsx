'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Executive {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

interface Schedule {
  id: string;
  actionType: string;
  schedule: string;
  isActive: boolean;
  nextRun: string;
}

const EXECUTIVES = [
  { id: 'cfo', name: 'CFO', role: 'Chief Financial Officer', icon: '💰' },
  { id: 'cto', name: 'CTO', role: 'Chief Technology Officer', icon: '🔧' },
  { id: 'cmo', name: 'CMO', role: 'Chief Marketing Officer', icon: '📢' },
  { id: 'coo', name: 'COO', role: 'Chief Operating Officer', icon: '⚙️' },
  { id: 'clo', name: 'CLO', role: 'Chief Legal Officer', icon: '⚖️' },
  { id: 'innovation', name: 'Innovation', role: 'Creative Strategist', icon: '💡' },
];

const ACTIONS = [
  { id: 'search', name: 'Search Internet', desc: 'Research market, competitors, trends' },
  { id: 'prospect', name: 'Prospect Leads', desc: 'Find and qualify new prospects' },
  { id: 'check_in', name: 'Check In', desc: 'Verify tasks, report status' },
  { id: 'reminder', name: 'Follow Up', desc: 'Remind about pending items' },
  { id: 'meeting', name: 'Host Meeting', desc: 'Run standup/sync without you' },
  { id: 'weekly_recap', name: '📋 Friday Weekly Recap', desc: 'Full board meeting - ops, challenges, accomplishments, next moves' },
];

export default function AutonomousPage() {
  const [schedules, setSchedules] = useState<{ [key: string]: Schedule[] }>({});
  const [showConfig, setShowConfig] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState({ action: '', schedule: 'daily_morning' });

  const saveSchedule = async (execId: string) => {
    if (!configForm.action) return;
    
    await fetch('/api/proactive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        executiveId: execId,
        actionType: configForm.action,
        schedule: configForm.schedule,
        config: { maxResults: 5, notify: true },
      }),
    });
    
    setShowConfig(null);
    setConfigForm({ action: '', schedule: 'daily_morning' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">← Back to Dashboard</Link>
        <h1 className="text-3xl font-bold mt-4">🤖 Autonomous Operations</h1>
        <p className="text-gray-600 mt-2">
          Configure AI executives to run proactively (8-hour business mode)
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>💡 Budget Mode:</strong> Running minimal proactive tasks within $1,000 cash. 
          Uses your OpenAI credits for AI operations. Free email via SMTP.
        </p>
      </div>

      <div className="space-y-6">
        {EXECUTIVES.map((exec) => (
          <div key={exec.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{exec.icon}</span>
                <div>
                  <h2 className="font-bold text-lg">{exec.name}</h2>
                  <p className="text-sm text-gray-500">{exec.role}</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfig(showConfig === exec.id ? null : exec.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ⚙️ Configure
              </button>
            </div>

            {showConfig === exec.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Proactive Action</label>
                    <select
                      value={configForm.action}
                      onChange={(e) => setConfigForm({ ...configForm, action: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Select action...</option>
                      {ACTIONS.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Schedule</label>
                    <select
                      value={configForm.schedule}
                      onChange={(e) => setConfigForm({ ...configForm, schedule: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="daily_morning">📅 Daily 8:00 AM (15 min)</option>
                      <option value="hourly">⏰ Hourly</option>
                      <option value="twice_daily">🌅 Morning + Afternoon</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => saveSchedule(exec.id)}
                  disabled={!configForm.action}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  ➕ Add to Schedule
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h2 className="font-bold mb-4">📋 Daily 8-Hour Business Schedule</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>8:00 AM</span><span>CMO - Search for leads, check emails</span></div>
          <div className="flex justify-between"><span>9:00 AM</span><span>CTO - Monitor servers, check issues</span></div>
          <div className="flex justify-between"><span>10:00 AM</span><span>COO - Review tasks, check status</span></div>
          <div className="flex justify-between"><span>11:00 AM</span><span>CMO - Contact qualified leads</span></div>
          <div className="flex justify-between"><span>12:00 PM</span><span>CFO - Daily financial check</span></div>
          <div className="flex justify-between"><span>1:00 PM</span><span>All - Team standup meeting</span></div>
          <div className="flex justify-between"><span>2:00 PM</span><span>CTO - Technical research</span></div>
          <div className="flex justify-between"><span>3:00 PM</span><span>CLO - Contract review</span></div>
          <div className="flex justify-between"><span>4:00 PM</span><span>CEO - End of day summary</span></div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          * Each slot runs 15 min max to stay within budget. Uses free services where possible.
        </p>
      </div>

      <div className="mt-6 bg-purple-50 rounded-xl p-6 border-2 border-purple-300">
        <h2 className="font-bold mb-4">📋 Friday Weekly Recap (ALL EXECUTIVES)</h2>
        <div className="space-y-3 text-sm">
          <div><strong>📊 Your Activities:</strong> All daily tasks reviewed - executives know what you've been working on this week</div>
          <div><strong>💬 Activity Feedback:</strong> Each exec can provide feedback on your work and rate performance (affects your score)</div>
          <div><strong>📊 Ops:</strong> Revenue, pipelines, deliverables status</div>
          <div><strong>⚠️ Challenges:</strong> Blockers, risks, cash flow issues</div>
          <div><strong>🏆 Accomplishments:</strong> Wins, closed deals, completed projects</div>
          <div><strong>🔜 What's Next:</strong> Next week priorities, goals</div>
          <div><strong>🎯 Strategic Moves:</strong> Big decisions, opportunities</div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          * Runs Friday 3PM. Before meeting: executives pull your daily activities, review them, and prepare feedback. Feedback saved to each activity.
        </p>
      </div>
    </div>
  );
}