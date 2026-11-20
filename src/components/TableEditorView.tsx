import React, { useState, useEffect } from 'react';
import { Table, Plus, Search, Trash2, Edit3, Filter, ChevronLeft, ChevronRight, Check, Code, ArrowUpDown, AlertCircle } from 'lucide-react';
import { TableDefinition } from '../types';
import { pb } from '../lib/pocketbase';

interface TableEditorViewProps {
  tables: TableDefinition[];
  onUpdateTableRows: (tableId: string, updatedRows: Record<string, any>[]) => void;
  pbOnline: boolean;
}

export const TableEditorView: React.FC<TableEditorViewProps> = ({ 
  tables, 
  onUpdateTableRows,
  pbOnline 
}) => {
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [showJsonView, setShowJsonView] = useState(false);
  const [liveRecords, setLiveRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentTable = tables.find(t => t.id === selectedTableId) || tables[0];

  useEffect(() => {
    if (pbOnline && currentTable) {
      fetchPocketBaseRecords(currentTable.name);
    }
  }, [pbOnline, selectedTableId]);

  const fetchPocketBaseRecords = async (collectionName: string) => {
    setLoadingRecords(true);
    setErrorMsg('');
    try {
      const result = await pb.collection(collectionName).getList(1, 50, { sort: '-created' });
      setLiveRecords(result.items || []);
    } catch (err: any) {
      setErrorMsg(err?.message || `Failed to fetch records for ${collectionName}`);
    } finally {
      setLoadingRecords(false);
    }
  };

  const activeRows = pbOnline ? liveRecords : currentTable?.rows || [];

  const filteredRows = activeRows.filter(row => {
    if (!searchQuery) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleOpenInsertModal = () => {
    const initial: Record<string, any> = {};
    currentTable?.columns.forEach(col => {
      if (col.name === 'id') {
        initial[col.name] = `rec-${Math.floor(Math.random() * 9000 + 1000)}`;
      } else if (col.name.includes('date') || col.name.includes('time') || col.name === 'created_at') {
        initial[col.name] = new Date().toISOString().replace('T', ' ').substring(0, 19);
      } else {
        initial[col.name] = '';
      }
    });
    setNewRowData(initial);
    setIsInsertModalOpen(true);
  };

  const handleInsertRowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTable) return;

    const processedRow: Record<string, any> = {};
    currentTable.columns.forEach(col => {
      let val = newRowData[col.name];
      if (col.type === 'integer' || col.type === 'numeric') {
        val = val !== '' ? Number(val) : 0;
      } else if (col.type === 'boolean') {
        val = val === 'true' || val === true;
      }
      processedRow[col.name] = val;
    });

    if (pbOnline) {
      try {
        await pb.collection(currentTable.name).create(processedRow);
        await fetchPocketBaseRecords(currentTable.name);
      } catch (err: any) {
        alert(`PocketBase insert error: ${err?.message}`);
        return;
      }
    }

    const updatedRows = [processedRow, ...currentTable.rows];
    onUpdateTableRows(currentTable.id, updatedRows);
    setIsInsertModalOpen(false);
  };

  const handleDeleteRow = async (rowIndex: number, recordId?: string) => {
    if (!currentTable) return;
    if (confirm('Are you sure you want to delete this record?')) {
      if (pbOnline && recordId) {
        try {
          await pb.collection(currentTable.name).delete(recordId);
          await fetchPocketBaseRecords(currentTable.name);
        } catch (err: any) {
          alert(`PocketBase delete error: ${err?.message}`);
          return;
        }
      }

      const updatedRows = currentTable.rows.filter((_, idx) => idx !== rowIndex);
      onUpdateTableRows(currentTable.id, updatedRows);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Table className="w-5 h-5 text-emerald-400" />
            <span>Table & Data Editor</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {pbOnline ? `Connected to PocketBase collection '${currentTable?.name}'` : 'Perform CRUD operations (Local demo mode)'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedTableId}
            onChange={(e) => setSelectedTableId(e.target.value)}
            className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-emerald-400 text-xs font-mono focus:outline-none focus:border-emerald-500"
          >
            {tables.map(t => (
              <option key={t.id} value={t.id}>collection.{t.name} ({t.rows.length} rows)</option>
            ))}
          </select>

          <button
            onClick={handleOpenInsertModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Insert Record</span>
          </button>
        </div>
      </div>

      {!pbOnline && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>PocketBase server offline. CRUD operations will update local state.</span>
        </div>
      )}

      {/* Filter and View Toggles */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={`Filter ${currentTable?.name} records...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowJsonView(!showJsonView)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
              showJsonView 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showJsonView ? 'Table View' : 'JSON View'}</span>
          </button>
        </div>
      </div>

      {/* Main Table / JSON View */}
      {currentTable && (
        <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/40">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
              <span className="text-emerald-400">collection:</span>
              <span className="font-bold">{currentTable.name}</span>
              <span className="text-zinc-400">({filteredRows.length} records)</span>
            </div>
            {pbOnline && <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Synced with PocketBase</span>}
          </div>

          {showJsonView ? (
            <div className="p-4 bg-zinc-950 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[500px]">
              <pre>{JSON.stringify(filteredRows, null, 2)}</pre>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px]">
              {filteredRows.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">#</th>
                      {currentTable.columns.map((c, i) => (
                        <th key={i} className="px-4 py-3">{c.name}</th>
                      ))}
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono">
                    {filteredRows.map((row, rIdx) => (
                      <tr key={row.id || rIdx} className="hover:bg-zinc-900/40 transition-colors group">
                        <td className="px-4 py-3 text-center text-zinc-400">{rIdx + 1}</td>
                        {currentTable.columns.map((c, cIdx) => (
                          <td key={cIdx} className="px-4 py-3 text-zinc-300 max-w-xs truncate">
                            {String(row[c.name] ?? 'NULL')}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteRow(rIdx, row.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-16 text-center text-zinc-400 text-xs font-mono">
                  No records found in this collection. Click 'Insert Record' to add data.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Insert Record Modal */}
      {isInsertModalOpen && currentTable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Insert Record into {currentTable.name}</span>
              </h3>
              <button 
                onClick={() => setIsInsertModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInsertRowSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {currentTable.columns.map((col, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="block text-xs font-mono text-zinc-300 flex items-center justify-between">
                    <span>{col.name} <span className="text-emerald-400">({col.type})</span></span>
                    {col.isPrimaryKey && <span className="text-[10px] text-amber-400">PK</span>}
                  </label>
                  <input
                    type={col.type === 'integer' || col.type === 'numeric' ? 'number' : 'text'}
                    step={col.type === 'numeric' ? '0.01' : '1'}
                    value={newRowData[col.name] ?? ''}
                    onChange={(e) => setNewRowData({ ...newRowData, [col.name]: e.target.value })}
                    placeholder={col.defaultValue || `Enter ${col.name}...`}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsInsertModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
