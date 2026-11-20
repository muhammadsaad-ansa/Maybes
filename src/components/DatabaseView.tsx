import React, { useState, useEffect } from 'react';
import { Database, Plus, Table, Key, Shield, Trash2, ChevronRight, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { TableDefinition, ColumnDefinition } from '../types';
import { pb } from '../lib/pocketbase';

interface DatabaseViewProps {
  tables: TableDefinition[];
  onAddTable: (newTable: TableDefinition) => void;
  onDeleteTable: (tableId: string) => void;
  pbOnline: boolean;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({ 
  tables, 
  onAddTable, 
  onDeleteTable,
  pbOnline 
}) => {
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || '');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pbCollections, setPbCollections] = useState<any[]>([]);
  const [loadingPb, setLoadingPb] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // New table form state
  const [newTableName, setNewTableName] = useState('');
  const [newColumns, setNewColumns] = useState<ColumnDefinition[]>([
    { name: 'id', type: 'uuid', isPrimaryKey: true, isNullable: false, defaultValue: 'gen_random_uuid()' },
    { name: 'created_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' }
  ]);

  useEffect(() => {
    if (pbOnline) {
      fetchPocketBaseCollections();
    }
  }, [pbOnline]);

  const fetchPocketBaseCollections = async () => {
    setLoadingPb(true);
    setErrorMsg('');
    try {
      const result = await pb.collections.getList(1, 50, { sort: 'name' });
      setPbCollections(result.items || []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to fetch PocketBase collections.');
    } finally {
      setLoadingPb(false);
    }
  };

  const selectedTable = tables.find(t => t.id === selectedTableId) || tables[0];

  const handleAddColumn = () => {
    setNewColumns([
      ...newColumns,
      { name: '', type: 'text', isNullable: true }
    ]);
  };

  const handleRemoveColumn = (index: number) => {
    if (newColumns.length <= 1) return;
    setNewColumns(newColumns.filter((_, i) => i !== index));
  };

  const handleCreateTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    const formattedName = newTableName.trim().toLowerCase().replace(/\s+/g, '_');
    if (tables.some(t => t.name === formattedName)) {
      alert(`Collection '${formattedName}' already exists.`);
      return;
    }

    // If PocketBase is online, we can create a collection in PocketBase!
    if (pbOnline) {
      try {
        await pb.collections.create({
          name: formattedName,
          type: 'base',
          schema: newColumns.map(c => ({
            name: c.name,
            type: c.type === 'uuid' ? 'text' : c.type === 'timestamp' ? 'date' : c.type === 'jsonb' ? 'json' : c.type,
            required: !c.isNullable
          }))
        });
        await fetchPocketBaseCollections();
      } catch (err: any) {
        alert(`PocketBase error creating collection: ${err?.message}`);
        return;
      }
    }

    const newTable: TableDefinition = {
      id: `table-${Date.now()}`,
      name: formattedName,
      schema: 'public',
      rowCount: 0,
      size: '16 KB',
      rlsEnabled: true,
      columns: newColumns.filter(c => c.name.trim()),
      rows: []
    };

    onAddTable(newTable);
    setSelectedTableId(newTable.id);
    setIsCreateModalOpen(false);
    setNewTableName('');
    setNewColumns([
      { name: 'id', type: 'uuid', isPrimaryKey: true, isNullable: false, defaultValue: 'gen_random_uuid()' },
      { name: 'created_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' }
    ]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>PocketBase Collections & Schema</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {pbOnline ? 'Connected to live PocketBase server. Showing real collections.' : 'PocketBase server offline. Showing cached demo collections.'}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Collection</span>
        </button>
      </div>

      {!pbOnline && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <strong>Server Offline Notice:</strong> PocketBase server is currently unreachable. You are viewing local demo tables. Start PocketBase (`./pocketbase serve`) and update your URL in Settings.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Table List Sidebar */}
        <div className="lg:col-span-1 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-4 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-2 pb-1 flex items-center justify-between">
            <span>PocketBase Collections</span>
            {pbOnline && <span className="text-emerald-400">Live</span>}
          </div>
          <div className="space-y-1">
            {tables.map(table => {
              const isSelected = table.id === selectedTable?.id;
              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedTableId(table.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ${
                    isSelected 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs' 
                      : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Table className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`} />
                    <span className="truncate">{table.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400">
                      {table.rows.length}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-zinc-400'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Table Schema Details */}
        <div className="lg:col-span-3 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-6 space-y-6">
          {selectedTable ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-zinc-100 font-mono">
                      collection.{selectedTable.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      PocketBase Base Collection
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Contains {selectedTable.rows.length} records · Size: {selectedTable.size}
                  </p>
                </div>

                {tables.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete collection '${selectedTable.name}'?`)) {
                        onDeleteTable(selectedTable.id);
                      }
                    }}
                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-medium border border-red-500/20 transition-all flex items-center gap-1.5 self-start"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Collection</span>
                  </button>
                )}
              </div>

              {/* Columns Table */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 font-mono mb-3">
                  Collection Schema Fields ({selectedTable.columns.length})
                </h4>
                <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/80 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800">
                      <tr>
                        <th className="px-4 py-3">Field Name</th>
                        <th className="px-4 py-3">Field Type</th>
                        <th className="px-4 py-3">Constraints</th>
                        <th className="px-4 py-3">Default Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {selectedTable.columns.map((col, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="px-4 py-3 font-mono font-medium text-zinc-200 flex items-center gap-2">
                            {col.isPrimaryKey && <span title="Primary Key"><Key className="w-3.5 h-3.5 text-amber-400 shrink-0" /></span>}
                            <span>{col.name}</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-emerald-400">{col.type}</td>
                          <td className="px-4 py-3 text-zinc-400">
                            {col.isPrimaryKey ? (
                              <span className="text-amber-400 font-medium">PRIMARY KEY</span>
                            ) : col.isNullable ? (
                              <span className="text-zinc-300">NULLABLE</span>
                            ) : (
                              <span className="text-zinc-200 font-medium">REQUIRED</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-400">
                            {col.defaultValue || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Data Preview */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 font-mono mb-3">
                  Records Preview ({selectedTable.rows.length} rows)
                </h4>
                {selectedTable.rows.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/60 max-h-64">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-900/80 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 sticky top-0">
                        <tr>
                          {selectedTable.columns.map((c, i) => (
                            <th key={i} className="px-4 py-2.5">{c.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 font-mono">
                        {selectedTable.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-zinc-900/40 transition-colors">
                            {selectedTable.columns.map((c, cIdx) => (
                              <td key={cIdx} className="px-4 py-2.5 text-zinc-300 truncate max-w-xs">
                                {String(row[c.name] ?? 'NULL')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-zinc-950/40 rounded-xl border border-zinc-800/60 text-zinc-400 text-xs">
                    No records found in this collection. Use the Table Editor to insert records.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-zinc-400">Select a collection to view schema details.</div>
          )}
        </div>
      </div>

      {/* Create Collection Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Table className="w-5 h-5 text-emerald-400" />
                <span>Create PocketBase Collection</span>
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTableSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. articles, comments, projects"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-zinc-300">Schema Fields</label>
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Field</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {newColumns.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                      <input
                        type="text"
                        required
                        placeholder="Field name"
                        value={col.name}
                        onChange={(e) => {
                          const updated = [...newColumns];
                          updated[idx].name = e.target.value;
                          setNewColumns(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <select
                        value={col.type}
                        onChange={(e) => {
                          const updated = [...newColumns];
                          updated[idx].type = e.target.value as any;
                          setNewColumns(updated);
                        }}
                        className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-emerald-400 text-xs font-mono focus:outline-none focus:border-emerald-500"
                      >
                        <option value="uuid">text (id)</option>
                        <option value="text">text</option>
                        <option value="integer">number</option>
                        <option value="boolean">bool</option>
                        <option value="timestamp">date</option>
                        <option value="jsonb">json</option>
                      </select>
                      {newColumns.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColumn(idx)}
                          className="text-zinc-500 hover:text-red-400 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Collection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
