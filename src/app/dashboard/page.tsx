'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Decision {
  id: string;
  objective: string;
  mode: string;
  riskTolerance: string;
  budget: string;
  timeline: string;
  decision: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/decisions')
      .then((res) => res.json())
      .then((data) => {
        setDecisions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getDecisionColor = (decision: string) => {
    const d = decision?.toLowerCase() || '';
    if (d.includes('approve')) return 'bg-green-100 text-green-800';
    if (d.includes('reject')) return 'bg-red-100 text-red-800';
    if (d.includes('modify')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getModeColor = (mode: string) => {
    const m = mode?.toUpperCase() || '';
    if (m === 'SURVIVAL') return 'bg-red-100 text-red-800';
    if (m === 'GROWTH') return 'bg-green-100 text-green-800';
    if (m === 'OPTIMIZATION') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Executive Dashboard</h1>
          <p className="text-gray-600 mt-1">AI-powered decision history</p>
        </div>
        <Link
          href="/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + New Decision
        </Link>
      </div>

      {decisions.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No decisions yet</p>
          <p className="text-gray-400 mt-2">Submit your first decision request to get started</p>
          <Link
            href="/new"
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            Create your first decision →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Objective</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Mode</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Budget</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Decision</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {decisions.map((decision) => (
                <tr key={decision.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/decision/${decision.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {decision.objective}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getModeColor(decision.mode)}`}>
                      {decision.mode}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{decision.budget}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getDecisionColor(decision.decision)}`}>
                      {decision.decision || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(decision.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/decision/${decision.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}