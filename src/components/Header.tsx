import React from 'react';
import { Menu, Search, Bell, Shield, Database, Sparkles, RefreshCw, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import { NavigationTab } from '../types';

interface HeaderProps {
  currentTab: NavigationTab;
  setMobileOpen: (open: boolean) => void;
  onResetData: () => void;
  pbStatus: { connected: boolean; message: string; url: string };
  onCheckHealth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentTab, 
  setMobileOpen, 
  onResetData, 
  pbStatus,
  onCheckHealth 
}) => {
  const getTabTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard': return 'Project Dashboard';
      case 'database': return 'Collections & Schema';
      case 'table-editor': return 'Table & Data Editor';
      case 'sql-editor': return 'Query & API Console';
      case 'auth': return 'PocketBase Auth';
      case 'storage': return 'File Storage Buckets';
      case 'api-manager': return 'PocketBase API Docs';
      case 'settings': return 'PocketBase Server Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-16 px-3 sm:px-6 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Menu & Breadcrumb */}
      <div className="flex items-center gap-3 overflow-hidden">
        <button 
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 md:hidden shrink-0"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 truncate">
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline">MYBASE PRO</span>
          <span className="text-zinc-600 hidden sm:inline">/</span>
          <h1 className="text-sm md:text-base font-semibold text-zinc-100 tracking-tight truncate">
            {getTabTitle(currentTab)}
          </h1>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* PocketBase Connection Status Indicator */}
        <button
          onClick={onCheckHealth}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            pbStatus.connected 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
          }`}
          title={`PocketBase URL: ${pbStatus.url} - Click to retest`}
        >
          {pbStatus.connected ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          )}
          <span className="truncate max-w-[140px]">
            {pbStatus.connected ? 'PB Online' : 'PB Offline'}
          </span>
        </button>

        {/* Quick Reset State Button */}
        <button
          onClick={() => {
            if (confirm('Reset demo state back to initial defaults?')) {
              onResetData();
            }
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
          title="Reset sample data"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reset</span>
        </button>

        {/* Notification Bell */}
        <button 
          className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg border border-transparent hover:border-zinc-800 relative transition-all"
          title="Notifications"
          onClick={() => alert(pbStatus.message)}
        >
          <Bell className="w-4 h-4" />
          <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${pbStatus.connected ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`} />
        </button>
      </div>
    </header>
  );
};
