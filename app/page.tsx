"use client";
import React, { useState, useEffect } from 'react';

// Define how our backend response looks
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

// Interface for history items pulled from database
interface HistoryItem {
  id: number;
  project_id: number;
  score: number;
  summary: string;
  created_at: string;
}

export default function Home() {
  const [code, setCode] = useState('');
  const [results, setResults] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Function to load the history log rows from our database
  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Error fetching history from backend database:", err);
    }
  };

  // Load history instantly on page initialization
  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAnalyze = async () => {
    if (!code.trim()) return alert("Please paste some code first!");
    
    setLoading(true);
    setResults(null);

    try {
      // Sending a POST request to our Node.js backend server
      const response = await fetch('http://localhost:5000/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codeSnippet: code }),
      });

      if (!response.ok) {
        throw new Error("Failed to reach the backend server");
      }

      const data = await response.json();
      setResults(data); // Save the backend findings to state to display below
      
      // Automatically refresh the history list to capture the newly saved row
      fetchHistory();
    } catch (error) {
      console.error(error);
      alert("Error reaching backend. Make sure your node server.js is running on port 5000!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-8">
      {/* Header section */}
      <header className="max-w-4xl w-full text-center my-8">
        <h1 className="text-4xl font-extrabold text-blue-400 mb-2">
          AI Code Review Assistant
        </h1>
        <p className="text-slate-400">
          Paste your code below to run our custom backend analysis engine.
        </p>
      </header>

      {/* Main Submission Form */}
      <section className="max-w-4xl w-full bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 mb-8">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Paste your source code (JavaScript / Python)
        </label>
        
        <textarea
          rows={10}
          className="w-full bg-slate-950 text-emerald-400 font-mono p-4 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="// Paste your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md"
          >
            {loading ? "Analyzing..." : "Analyze Code"}
          </button>
        </div>
      </section>

      {/* Dashboard Results Section (Only displays when the backend responds) */}
      {results && (
        <section className="max-w-4xl w-full bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 mb-8">
          <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-4">
            <h2 className="text-2xl font-bold text-slate-200">Review Dashboard</h2>
            <div className="text-right">
              <span className="text-sm text-slate-400 block">Overall Score</span>
              <span className={`text-3xl font-black ${results.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {results.score} / 100
              </span>
            </div>
          </div>

          <p className="text-slate-300 italic mb-6">"{results.summary}"</p>

          <h3 className="text-lg font-semibold text-slate-200 mb-3">Review Findings ({results.findings.length})</h3>
          
          {results.findings.length === 0 ? (
            <p className="text-emerald-400 font-medium">✨ No issues detected in this snippet!</p>
          ) : (
            <div className="space-y-4">
              {results.findings.map((finding, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-lg border-l-4 border-amber-500">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-200 text-lg">{finding.issue}</h4>
                    <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wide rounded bg-amber-500/20 text-amber-400">
                      Line {finding.line_number} • {finding.severity}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{finding.explanation}</p>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-xs text-emerald-400">
                    <span className="text-slate-500 block select-none mb-1">// Suggested Fix:</span>
                    {finding.suggested_fix}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Cloud Database Review History Logs Panel */}
      <section className="max-w-4xl w-full bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700">
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          📜 Cloud Scan History Logs
        </h2>
        
        {history.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No past database scans recorded yet.</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {history.map((item) => (
              <div key={item.id} className="p-4 bg-slate-950 rounded-lg flex justify-between items-center border-l-4 border-blue-500 shadow-sm">
                <div className="flex-1 pr-4">
                  <p className="text-slate-300 text-sm font-medium line-clamp-1">{item.summary}</p>
                  <span className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-right min-w-[70px]">
                  <span className={`text-base font-bold ${item.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {item.score} / 100
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}