import React, { useState } from 'react';
import { Code2, Zap, Copy, Check, Terminal, FileText, Globe } from 'lucide-react';
import { TableDefinition } from '../types';
import { pb, getPocketBaseUrl } from '../lib/pocketbase';

interface ApiManagerViewProps {
  tables: TableDefinition[];
}

export const ApiManagerView: React.FC<ApiManagerViewProps> = ({ tables }) => {
  const [selectedTable, setSelectedTable] = useState<string>(tables[0]?.name || 'users');
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST' | 'PATCH' | 'DELETE'>('GET');
  const [activeTab, setActiveTab] = useState<'rest' | 'sdk' | 'swagger'>('rest');
  const [copied, setCopied] = useState(false);

  const pbUrl = getPocketBaseUrl();

  const getCurlSnippet = () => {
    switch (selectedMethod) {
      case 'GET':
        return `curl -X GET "${pbUrl}/api/collections/${selectedTable}/records" \\\n  -H "Authorization: TOKEN"`;
      case 'POST':
        return `curl -X POST "${pbUrl}/api/collections/${selectedTable}/records" \\\n  -H "Content-Type: application/json" \\\n  -d '{"title": "New Record"}'`;
      case 'PATCH':
        return `curl -X PATCH "${pbUrl}/api/collections/${selectedTable}/records/RECORD_ID" \\\n  -H "Content-Type: application/json" \\\n  -d '{"title": "Updated Record"}'`;
      case 'DELETE':
        return `curl -X DELETE "${pbUrl}/api/collections/${selectedTable}/records/RECORD_ID"`;
    }
  };

  const getSdkSnippet = () => {
    switch (selectedMethod) {
      case 'GET':
        return `import PocketBase from 'pocketbase';\n\nconst pb = new PocketBase('${pbUrl}');\n\n// Fetch list of records\nconst records = await pb.collection('${selectedTable}').getList(1, 50, {\n  sort: '-created',\n});`;
      case 'POST':
        return `import PocketBase from 'pocketbase';\n\nconst pb = new PocketBase('${pbUrl}');\n\n// Create a new record\nconst record = await pb.collection('${selectedTable}').create({\n  title: 'New Record',\n});`;
      case 'PATCH':
        return `import PocketBase from 'pocketbase';\n\nconst pb = new PocketBase('${pbUrl}');\n\n// Update record by ID\nconst record = await pb.collection('${selectedTable}').update('RECORD_ID', {\n  title: 'Updated',\n});`;
      case 'DELETE':
        return `import PocketBase from 'pocketbase';\n\nconst pb = new PocketBase('${pbUrl}');\n\n// Delete record by ID\nawait pb.collection('${selectedTable}').delete('RECORD_ID');`;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <span>PocketBase API & SDK Manager</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Explore auto-generated PocketBase REST API endpoints and JavaScript SDK code snippets.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('rest')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'rest' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            REST API
          </button>
          <button
            onClick={() => setActiveTab('sdk')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'sdk' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            JS SDK Code
          </button>
          <button
            onClick={() => setActiveTab('swagger')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'swagger' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Swagger UI
          </button>
        </div>
      </div>

      {(activeTab === 'rest' || activeTab === 'sdk') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Collection & Method Selector */}
          <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-6 space-y-6">
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Endpoint Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Select Collection</label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-emerald-400 text-xs font-mono focus:outline-none focus:border-emerald-500"
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Method / Action</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['GET', 'POST', 'PATCH', 'DELETE'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setSelectedMethod(method)}
                      className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all ${
                        selectedMethod === method 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs' 
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs text-zinc-400 font-mono">
              <div className="text-zinc-200 font-bold">PocketBase URL</div>
              <div className="text-emerald-400 truncate">{pbUrl}/api/collections/{selectedTable}/records</div>
            </div>
          </div>

          {/* Right: Code Generator */}
          <div className="lg:col-span-2 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200 font-mono">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>{activeTab === 'rest' ? 'cURL Request Snippet' : 'PocketBase JS SDK Snippet'}</span>
              </div>
              <button
                onClick={() => handleCopy(activeTab === 'rest' ? getCurlSnippet() : getSdkSnippet())}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 border border-emerald-500/30"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
              <pre>{activeTab === 'rest' ? getCurlSnippet() : getSdkSnippet()}</pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'swagger' && (
        <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-8 text-center space-y-4">
          <Globe className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-100">PocketBase Interactive API Dashboard</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            PocketBase includes a built-in interactive Admin UI and API documentation dashboard at <code className="text-emerald-400 font-mono">{pbUrl}/_/</code>.
          </p>
          <div className="pt-2">
            <a 
              href={`${pbUrl}/_/`} 
              target="_blank" 
              rel="noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium inline-flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
            >
              <span>Open PocketBase Admin UI</span>
              <Zap className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
