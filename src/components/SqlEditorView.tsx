import React, { useState } from 'react';
import { Terminal, Play, Sparkles, History, CheckCircle2, AlertCircle, Copy, Check, Clock } from 'lucide-react';
import { TableDefinition, SqlQueryHistory } from '../types';
import { GoogleGenAI } from '@google/genai';

interface SqlEditorViewProps {
  tables: TableDefinition[];
}

export const SqlEditorView: React.FC<SqlEditorViewProps> = ({ tables }) => {
  const [query, setQuery] = useState('SELECT * FROM users WHERE is_active = true;');
  const [queryResult, setQueryResult] = useState<any[] | null>([
    { id: 'u-101', name: 'Lumajang Saad', email: 'lumajangsaad@gmail.com', role: 'admin', is_active: true },
    { id: 'u-102', name: 'Siti Rahma', email: 'siti.rahma@example.com', role: 'moderator', is_active: true },
    { id: 'u-103', name: 'Budi Santoso', email: 'budi.santoso@example.com', role: 'customer', is_active: true }
  ]);
  const [executionTime, setExecutionTime] = useState<number>(14);
  const [executionStatus, setExecutionStatus] = useState<'success' | 'error' | null>('success');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [history, setHistory] = useState<SqlQueryHistory[]>([
    { id: 'h-1', query: 'SELECT * FROM users WHERE is_active = true;', executedAt: '10:42 AM', durationMs: 14, status: 'success', rowsAffected: 3 }
  ]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const sampleQueries = [
    { label: 'Select all active users', sql: 'SELECT * FROM users WHERE is_active = true;' },
    { label: 'Find products above $300', sql: 'SELECT title, price, stock FROM products WHERE price > 300 ORDER BY price DESC;' },
    { label: 'Count orders by status', sql: 'SELECT status, COUNT(*) as total_orders FROM orders GROUP BY status;' },
    { label: 'Recent application logs', sql: 'SELECT level, message, created_at FROM app_logs ORDER BY created_at DESC LIMIT 5;' }
  ];

  const handleRunQuery = () => {
    const startTime = performance.now();
    const cleanQuery = query.trim().toLowerCase();

    try {
      if (cleanQuery.startsWith('select')) {
        // Simple query mock parser
        let resultRows: any[] = [];
        if (cleanQuery.includes('users')) {
          resultRows = tables.find(t => t.name === 'users')?.rows || [];
          if (cleanQuery.includes('is_active = true')) {
            resultRows = resultRows.filter(r => r.is_active === true);
          }
        } else if (cleanQuery.includes('products')) {
          resultRows = tables.find(t => t.name === 'products')?.rows || [];
          if (cleanQuery.includes('price > 300')) {
            resultRows = resultRows.filter(r => Number(r.price) > 300);
          }
        } else if (cleanQuery.includes('orders')) {
          resultRows = tables.find(t => t.name === 'orders')?.rows || [];
        } else if (cleanQuery.includes('app_logs')) {
          resultRows = tables.find(t => t.name === 'app_logs')?.rows || [];
        } else {
          resultRows = tables[0]?.rows || [];
        }

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime + 8);
        setExecutionTime(duration);
        setQueryResult(resultRows);
        setExecutionStatus('success');
        setErrorMessage('');

        const newHistoryItem: SqlQueryHistory = {
          id: `h-${Date.now()}`,
          query: query,
          executedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          durationMs: duration,
          status: 'success',
          rowsAffected: resultRows.length
        };
        setHistory([newHistoryItem, ...history.slice(0, 9)]);
      } else {
        // Insert / Update / Delete simulation
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime + 12);
        setExecutionTime(duration);
        setQueryResult([{ status: 'OK', rows_affected: 1, message: 'Query executed successfully' }]);
        setExecutionStatus('success');
        setErrorMessage('');
      }
    } catch (err: any) {
      setExecutionStatus('error');
      setErrorMessage(err.message || 'Syntax error near SQL statement');
      setQueryResult(null);
    }
  };

  const handleGenerateAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY || '';
      if (!apiKey) {
        // Fallback simulation if key not configured
        setTimeout(() => {
          setQuery(`SELECT * FROM users WHERE name ILIKE '%${aiPrompt}%' ORDER BY created_at DESC;`);
          setIsAiLoading(false);
          setAiPrompt('');
        }, 600);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert PostgreSQL DBA for MYBASE PRO. The database schema contains tables: users (id, name, email, role, is_active, created_at), products (id, title, price, stock, category, created_at), orders (id, user_id, total_amount, status, created_at), app_logs (id, level, message, metadata, created_at). Write a valid PostgreSQL SQL query for this request: "${aiPrompt}". Return ONLY the raw SQL query without markdown code blocks or backticks.`
      });

      const generatedSql = response.text ? response.text.trim().replace(/^```sql/i, '').replace(/^```/i, '').replace(/```$/i, '').trim() : 'SELECT * FROM users;';
      setQuery(generatedSql);
      setAiPrompt('');
    } catch (err) {
      console.error(err);
      setQuery(`SELECT * FROM users WHERE email ILIKE '%${aiPrompt}%';`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span>SQL Editor & Query Runner</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Run custom PostgreSQL queries, analyze execution performance, or generate queries with Gemini AI.
          </p>
        </div>

        <button
          onClick={handleRunQuery}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Run Query (Ctrl + Enter)</span>
        </button>
      </div>

      {/* AI Query Assistant Bar */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900/80 to-zinc-900/80 p-4 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-emerald-400 shrink-0">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">Gemini AI Assistant</span>
        </div>
        <form onSubmit={handleGenerateAiQuery} className="flex items-center gap-2 w-full">
          <input
            type="text"
            placeholder="Describe what SQL query you want to write in plain English..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isAiLoading}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            {isAiLoading ? <span className="animate-spin">⏳</span> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Generate SQL</span>
          </button>
        </form>
      </div>

      {/* Sample Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-400 font-mono">Sample Presets:</span>
        {sampleQueries.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => setQuery(preset.sql)}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs border border-zinc-800 transition-colors font-mono"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Code Editor Box */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>SQL Query Console</span>
          <span>PostgreSQL 16</span>
        </div>
        <textarea
          rows={5}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-4 bg-zinc-950 text-emerald-400 font-mono text-xs focus:outline-none resize-y leading-relaxed"
          placeholder="Enter SQL statement here..."
        />
        <div className="px-4 py-3 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-mono">
            {executionStatus === 'success' && (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Success ({executionTime} ms)</span>
              </span>
            )}
            {executionStatus === 'error' && (
              <span className="text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Error: {errorMessage}</span>
              </span>
            )}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(query);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy SQL'}</span>
          </button>
        </div>
      </div>

      {/* Query Results Grid */}
      <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/40">
          <h3 className="text-sm font-semibold text-zinc-200 font-mono">Query Results Output</h3>
          <span className="text-xs font-mono text-zinc-400">
            {queryResult ? `${queryResult.length} rows returned` : '0 rows'}
          </span>
        </div>

        <div className="overflow-x-auto max-h-80">
          {queryResult && queryResult.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 sticky top-0">
                <tr>
                  {Object.keys(queryResult[0]).map((key, i) => (
                    <th key={i} className="px-4 py-3">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {queryResult.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-900/40 transition-colors">
                    {Object.values(row).map((val: any, vIdx) => (
                      <td key={vIdx} className="px-4 py-3 text-zinc-300 max-w-xs truncate">
                        {String(val ?? 'NULL')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-zinc-400 text-xs font-mono">
              Query executed successfully. No result records returned.
            </div>
          )}
        </div>
      </div>

      {/* Query History */}
      <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
          <History className="w-4 h-4 text-emerald-400" />
          <span>Recent Query History</span>
        </div>
        <div className="space-y-2">
          {history.map(item => (
            <div 
              key={item.id}
              onClick={() => setQuery(item.query)}
              className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-emerald-500/40 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="font-mono text-xs text-zinc-300 truncate max-w-xl group-hover:text-emerald-400 transition-colors">
                {item.query}
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 shrink-0">
                <span>{item.durationMs} ms</span>
                <span>{item.executedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
