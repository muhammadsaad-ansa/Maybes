import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Table, 
  Terminal, 
  Users, 
  HardDrive, 
  Code2, 
  Settings, 
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onSelectTab, 
  mobileOpen, 
  setMobileOpen 
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'database', label: 'Database Schema', icon: <Database className="w-4 h-4" /> },
    { id: 'table-editor', label: 'Table Editor', icon: <Table className="w-4 h-4" />, badge: 'CRUD' },
    { id: 'sql-editor', label: 'SQL Editor', icon: <Terminal className="w-4 h-4" />, badge: 'AI' },
    { id: 'auth', label: 'Authentication', icon: <Users className="w-4 h-4" /> },
    { id: 'storage', label: 'Storage Buckets', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'api-manager', label: 'API Manager', icon: <Code2 className="w-4 h-4" /> },
    { id: 'settings', label: 'Project Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:z-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-inner">
              MB
            </div>
            <div>
              <div className="font-bold text-zinc-100 tracking-wide flex items-center gap-1.5">
                MYBASE <span className="text-emerald-400 font-extrabold">PRO</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono tracking-wider">ENTERPRISE v2.5</div>
            </div>
          </div>
        </div>

        {/* Project Context */}
        <div className="px-4 py-3 mx-3 mt-4 mb-2 bg-zinc-900/60 rounded-xl border border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="truncate">
              <div className="text-xs font-medium text-zinc-200 truncate">Production DB</div>
              <div className="text-[11px] text-zinc-400 font-mono truncate">ap-southeast-1</div>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
            ONLINE
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Database & Backend
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                  ${isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-colors ${isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin User Footer Profile */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-zinc-700 flex items-center justify-center text-white font-bold text-sm shadow-md border border-emerald-500/30 shrink-0">
                LS
              </div>
              <div className="truncate">
                <div className="text-sm font-medium text-zinc-200 truncate">Lumajang Saad</div>
                <div className="text-xs text-zinc-400 truncate">Owner & Admin</div>
              </div>
            </div>
            <div className="p-1 rounded-md text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shrink-0" title="Administrator Verified">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
