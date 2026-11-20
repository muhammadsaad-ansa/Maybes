import React from 'react';
import { 
  Database, 
  Table, 
  Users, 
  HardDrive, 
  Activity, 
  ArrowUpRight, 
  Terminal, 
  Plus, 
  ShieldCheck, 
  Server, 
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TableDefinition, AuthUser, StorageBucket, NavigationTab } from '../types';

interface DashboardViewProps {
  tables: TableDefinition[];
  users: AuthUser[];
  buckets: StorageBucket[];
  onNavigate: (tab: NavigationTab) => void;
  pbStatus: { connected: boolean; message: string; url: string };
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  tables, 
  users, 
  buckets, 
  onNavigate,
  pbStatus 
}) => {
  const totalRows = tables.reduce((acc, t) => acc + t.rows.length, 0);
  const totalStorageSize = buckets.reduce((acc, b) => acc + parseFloat(b.size || '0'), 0).toFixed(1) + ' MB';

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800 relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>POCKETBASE BACKEND PLATFORM · OWNER: LUMAJANG SAAD</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono ${
              pbStatus.connected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}>
              {pbStatus.connected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{pbStatus.message}</span>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight mb-2">
            MYBASE PRO Control Center
          </h2>
          <p className="text-zinc-400 text-sm max-w-2xl mb-6">
            Powered by PocketBase JavaScript SDK. Connected to server at <code className="text-emerald-400 font-mono">{pbStatus.url}</code>. Manage collections, real-time records, authentication, and file storage.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('table-editor')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
            >
              <Table className="w-4 h-4" />
              <span>Open Table Editor</span>
            </button>
            <button
              onClick={() => onNavigate('database')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-all border border-zinc-700/80 flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Collections Schema</span>
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-all border border-zinc-700/80 flex items-center gap-2"
            >
              <Server className="w-4 h-4 text-amber-400" />
              <span>Server Settings</span>
            </button>
          </div>
        </div>
      </div>

      {!pbStatus.connected && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <strong>Server Connection Error:</strong> Unable to connect to PocketBase at <code className="font-mono">{pbStatus.url}</code>. Please make sure PocketBase is running (<code className="font-mono">./pocketbase serve</code>) or update your URL in <button onClick={() => onNavigate('settings')} className="underline font-bold text-white">Settings</button>.
          </div>
        </div>
      )}

      {/* Database Statistics Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            PocketBase Server Telemetry
          </h3>
          <span className="text-xs text-zinc-400 font-mono">{pbStatus.connected ? 'Live Sync Active' : 'Offline Mode'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80 backdrop-blur-sm relative group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400">Collections</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold font-mono text-zinc-100 mb-1">
              {tables.length}
            </div>
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span className="text-emerald-400 font-medium">PocketBase</span> base schema
            </div>
          </div>

          <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80 backdrop-blur-sm relative group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400">Total Records</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Table className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold font-mono text-zinc-100 mb-1">
              {totalRows}
            </div>
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span className="text-blue-400 font-medium">Synced</span> across collections
            </div>
          </div>

          <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80 backdrop-blur-sm relative group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400">Auth Users</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold font-mono text-zinc-100 mb-1">
              {users.length}
            </div>
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span className="text-purple-400 font-medium">{users.filter(u => u.status === 'active').length}</span> active users
            </div>
          </div>

          <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80 backdrop-blur-sm relative group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400">File Storage</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold font-mono text-zinc-100 mb-1">
              {totalStorageSize}
            </div>
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span className="text-amber-400 font-medium">{buckets.length}</span> buckets configured
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
