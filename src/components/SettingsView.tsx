import React, { useState } from 'react';
import { Settings, Shield, Key, Copy, Check, Eye, EyeOff, Server, Database, AlertTriangle, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { pb, getPocketBaseUrl, setPocketBaseUrl, checkPocketBaseHealth } from '../lib/pocketbase';

interface SettingsViewProps {
  pbStatus: { connected: boolean; message: string; url: string };
  onCheckHealth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ pbStatus, onCheckHealth }) => {
  const [urlInput, setUrlInput] = useState(getPocketBaseUrl());
  const [savingUrl, setSavingUrl] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setSavingUrl(true);
    setPocketBaseUrl(urlInput.trim());
    
    setTimeout(async () => {
      await onCheckHealth();
      setSavingUrl(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 500);
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>PocketBase Server & Project Settings</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Configure your PocketBase server URL (`POCKETBASE_URL`), test server connectivity, and manage API settings.
          </p>
        </div>
      </div>

      {/* PocketBase URL Configuration Card */}
      <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              PocketBase Backend Connection
            </h3>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono ${
            pbStatus.connected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {pbStatus.connected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>{pbStatus.message}</span>
          </div>
        </div>

        <form onSubmit={handleSaveUrl} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              PocketBase Server URL (<code className="text-emerald-400 font-mono">POCKETBASE_URL</code>)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://127.0.0.1:8090"
                className="flex-1 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={savingUrl}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-emerald-900/30 whitespace-nowrap"
              >
                {savingUrl ? 'Connecting...' : 'Save & Test'}
              </button>
            </div>
            {saveSuccess && (
              <p className="text-xs text-emerald-400 font-mono mt-2">✓ PocketBase configuration updated successfully.</p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
            <div className="text-xs font-semibold text-zinc-200">How to run PocketBase locally:</div>
            <div className="text-xs font-mono text-zinc-400 space-y-1">
              <div>1. Download PocketBase from <a href="https://pocketbase.io" target="_blank" rel="noreferrer" className="text-emerald-400 underline">pocketbase.io</a></div>
              <div>2. Run in your terminal: <code className="text-emerald-300 bg-zinc-900 px-1.5 py-0.5 rounded">./pocketbase serve</code></div>
              <div>3. Default local address is usually <code className="text-emerald-300 bg-zinc-900 px-1.5 py-0.5 rounded">http://127.0.0.1:8090</code></div>
            </div>
          </div>
        </form>

        <div className="pt-2">
          <button
            onClick={onCheckHealth}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-all border border-zinc-700 flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test Connection Now</span>
          </button>
        </div>
      </div>

      {/* Project General Info */}
      <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono">
          Project General Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Project Name</label>
            <input
              type="text"
              readOnly
              value="MYBASE PRO"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Owner & Administrator</label>
            <input
              type="text"
              readOnly
              value="Lumajang Saad (lumajangsaad@gmail.com)"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-emerald-400 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Backend Engine</label>
            <input
              type="text"
              readOnly
              value="PocketBase JavaScript SDK"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Authentication State</label>
            <input
              type="text"
              readOnly
              value={pb.authStore.isValid ? `Authenticated as ${pb.authStore.model?.email || 'Admin'}` : 'Not logged in'}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-emerald-400 text-xs font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
