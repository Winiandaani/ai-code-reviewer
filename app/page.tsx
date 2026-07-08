"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Finding {
  severity: string;
  issue: string;
  explanation: string;
  suggested_fix: string;
  line_number: number;
}

interface ReviewResponse {
  score: number;
  summary: string;
  findings: Finding[];
}

interface HistoryItem {
  id: number;
  project_id: number;
  score: number;
  summary: string;
  created_at: string;
}

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const [results, setResults] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedScan, setSelectedScan] = useState<HistoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const supabase = createClient();
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setIsAuthenticated(true);
      else router.push('/login');
    };
    checkSession();
  }, [router]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/history');
      if (res.ok) setHistory(await res.json());
    } catch (err) { console.error("Error fetching history:", err); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleAnalyze = async () => {
    // Basic "Static Analysis" check
    if (code.length < 20) return alert("Code snippet is too short for meaningful analysis.");
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeSnippet: code }),
      });
      const data = await response.json();
      setResults(data);
      fetchHistory();
    } catch (error) {
      alert("Error reaching backend. Ensure server is running.");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => 
    item.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedScan(null)}>
          <div className="bg-slate-800 p-8 rounded-xl max-w-2xl w-full border border-slate-700" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-2">Scan Details</h2>
            <p className="text-slate-400 mb-4">{new Date(selectedScan.created_at).toLocaleString()}</p>
            <div className="bg-slate-900 p-4 rounded-lg text-slate-200">{selectedScan.summary}</div>
            <button onClick={() => setSelectedScan(null)} className="mt-6 bg-blue-600 px-4 py-2 rounded">Close</button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input and Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <header>
            <h1 className="text-3xl font-bold text-blue-400">Code Review Studio</h1>
            <p className="text-slate-400">Professional AI analysis for your codebase.</p>
          </header>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
            <textarea
              className="w-full bg-black text-emerald-400 font-mono p-4 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={12}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here..."
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Run AI Analysis"}
            </button>
          </div>

          {results && (
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h3 className="text-xl font-bold mb-2">Analysis Results ({results.score}/100)</h3>
              <p className="text-slate-400 italic">{results.summary}</p>
            </div>
          )}
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4">Recent Scans</h2>
          <input 
            placeholder="Search history..." 
            className="w-full bg-slate-900 p-3 rounded-lg border border-slate-800 mb-4 text-sm"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="space-y-3 h-[600px] overflow-y-auto pr-2">
            {filteredHistory.map((item) => (
              <button 
                key={item.id}
                onClick={() => setSelectedScan(item)}
                className="w-full text-left bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-blue-500 transition-all"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-blue-400">SCORE: {item.score}</span>
                  <span className="text-[10px] text-slate-500">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-300 truncate">{item.summary}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}