import React, { useState, useEffect } from 'react';
import { NavigationTab, TableDefinition, AuthUser, StorageBucket, StorageFile } from './types';
import { INITIAL_TABLES, INITIAL_USERS, INITIAL_BUCKETS, INITIAL_FILES } from './mockData';
import { pb, checkPocketBaseHealth, getPocketBaseUrl } from './lib/pocketbase';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DatabaseView } from './components/DatabaseView';
import { TableEditorView } from './components/TableEditorView';
import { SqlEditorView } from './components/SqlEditorView';
import { AuthView } from './components/AuthView';
import { StorageView } from './components/StorageView';
import { ApiManagerView } from './components/ApiManagerView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [pbStatus, setPbStatus] = useState<{ connected: boolean; message: string; url: string }>({
    connected: false,
    message: 'Checking PocketBase connection...',
    url: getPocketBaseUrl()
  });

  // Persistent state via localStorage
  const [tables, setTables] = useState<TableDefinition[]>(() => {
    const saved = localStorage.getItem('mybase_pro_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [users, setUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem('mybase_pro_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [buckets, setBuckets] = useState<StorageBucket[]>(() => {
    const saved = localStorage.getItem('mybase_pro_buckets');
    return saved ? JSON.parse(saved) : INITIAL_BUCKETS;
  });

  const [files, setFiles] = useState<StorageFile[]>(() => {
    const saved = localStorage.getItem('mybase_pro_files');
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });

  const verifyPocketBase = async () => {
    const res = await checkPocketBaseHealth();
    setPbStatus({
      connected: res.status,
      message: res.message,
      url: getPocketBaseUrl()
    });
  };

  useEffect(() => {
    verifyPocketBase();
  }, []);

  useEffect(() => {
    localStorage.setItem('mybase_pro_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('mybase_pro_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('mybase_pro_buckets', JSON.stringify(buckets));
  }, [buckets]);

  useEffect(() => {
    localStorage.setItem('mybase_pro_files', JSON.stringify(files));
  }, [files]);

  const handleResetData = () => {
    setTables(INITIAL_TABLES);
    setUsers(INITIAL_USERS);
    setBuckets(INITIAL_BUCKETS);
    setFiles(INITIAL_FILES);
    localStorage.clear();
  };

  // Table handlers
  const handleAddTable = (newTable: TableDefinition) => {
    setTables([...tables, newTable]);
  };

  const handleDeleteTable = (tableId: string) => {
    setTables(tables.filter(t => t.id !== tableId));
  };

  const handleUpdateTableRows = (tableId: string, updatedRows: Record<string, any>[]) => {
    setTables(tables.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          rowCount: updatedRows.length,
          rows: updatedRows
        };
      }
      return t;
    }));
  };

  // Auth handlers
  const handleAddUser = (newUser: AuthUser) => {
    setUsers([newUser, ...users]);
  };

  const handleUpdateUserStatus = (userId: string, newStatus: 'active' | 'banned') => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  };

  // Storage handlers
  const handleAddBucket = (newBucket: StorageBucket) => {
    setBuckets([...buckets, newBucket]);
  };

  const handleAddFile = (newFile: StorageFile) => {
    setFiles([newFile, ...files]);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Left Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        onSelectTab={setCurrentTab} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          currentTab={currentTab} 
          setMobileOpen={setMobileOpen} 
          onResetData={handleResetData}
          pbStatus={pbStatus}
          onCheckHealth={verifyPocketBase}
        />

        <main className="flex-1 p-3 sm:p-5 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView 
                tables={tables} 
                users={users} 
                buckets={buckets} 
                onNavigate={setCurrentTab}
                pbStatus={pbStatus}
              />
            )}
            {currentTab === 'database' && (
              <DatabaseView 
                tables={tables} 
                onAddTable={handleAddTable} 
                onDeleteTable={handleDeleteTable}
                pbOnline={pbStatus.connected}
              />
            )}
            {currentTab === 'table-editor' && (
              <TableEditorView 
                tables={tables} 
                onUpdateTableRows={handleUpdateTableRows}
                pbOnline={pbStatus.connected}
              />
            )}
            {currentTab === 'sql-editor' && (
              <SqlEditorView tables={tables} />
            )}
            {currentTab === 'auth' && (
              <AuthView 
                users={users} 
                onAddUser={handleAddUser} 
                onUpdateUserStatus={handleUpdateUserStatus}
                pbOnline={pbStatus.connected}
              />
            )}
            {currentTab === 'storage' && (
              <StorageView 
                buckets={buckets} 
                files={files} 
                onAddBucket={handleAddBucket} 
                onAddFile={handleAddFile} 
                onDeleteFile={handleDeleteFile}
                pbOnline={pbStatus.connected}
              />
            )}
            {currentTab === 'api-manager' && (
              <ApiManagerView tables={tables} />
            )}
            {currentTab === 'settings' && (
              <SettingsView 
                pbStatus={pbStatus}
                onCheckHealth={verifyPocketBase}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
