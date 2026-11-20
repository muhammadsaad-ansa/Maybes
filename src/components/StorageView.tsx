import React, { useState } from 'react';
import { HardDrive, Plus, Folder, File, Upload, Trash2, Globe, Lock, Copy, Check, AlertCircle } from 'lucide-react';
import { StorageBucket, StorageFile } from '../types';
import { pb } from '../lib/pocketbase';

interface StorageViewProps {
  buckets: StorageBucket[];
  files: StorageFile[];
  onAddBucket: (bucket: StorageBucket) => void;
  onAddFile: (file: StorageFile) => void;
  onDeleteFile: (fileId: string) => void;
  pbOnline: boolean;
}

export const StorageView: React.FC<StorageViewProps> = ({ 
  buckets, 
  files, 
  onAddBucket, 
  onAddFile, 
  onDeleteFile,
  pbOnline 
}) => {
  const [selectedBucketId, setSelectedBucketId] = useState<string>(buckets[0]?.id || 'b-1');
  const [isBucketModalOpen, setIsBucketModalOpen] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [isPublicBucket, setIsPublicBucket] = useState(true);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  const selectedBucket = buckets.find(b => b.id === selectedBucketId) || buckets[0];
  const bucketFiles = files.filter(f => f.bucketId === selectedBucket?.id);

  const handleCreateBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketName.trim()) return;

    const formattedName = newBucketName.trim().toLowerCase().replace(/\s+/g, '-');
    if (buckets.some(b => b.name === formattedName)) {
      alert(`Bucket '${formattedName}' already exists.`);
      return;
    }

    const newBucket: StorageBucket = {
      id: `b-${Date.now()}`,
      name: formattedName,
      public: isPublicBucket,
      fileCount: 0,
      size: '0 KB',
      createdAt: new Date().toISOString().substring(0, 10)
    };

    onAddBucket(newBucket);
    setSelectedBucketId(newBucket.id);
    setIsBucketModalOpen(false);
    setNewBucketName('');
  };

  const handleSimulateUpload = () => {
    const sampleNames = ['document-scan.pdf', 'hero-wallpaper.jpg', 'avatar-user.png', 'config-backup.json'];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const newFile: StorageFile = {
      id: `f-${Date.now()}`,
      bucketId: selectedBucket.id,
      name: `${Math.floor(Math.random() * 900 + 100)}-${randomName}`,
      size: `${(Math.random() * 2 + 0.2).toFixed(1)} MB`,
      mimeType: randomName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
      createdAt: new Date().toISOString().substring(0, 10),
      url: `${pb.baseUrl}/api/files/storage_collection/rec123/${randomName}`
    };

    onAddFile(newFile);
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <span>PocketBase File Storage</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {pbOnline ? 'Connected to PocketBase file storage engine.' : 'PocketBase server offline (Local storage demo mode).'}
          </p>
        </div>

        <button
          onClick={() => setIsBucketModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Bucket</span>
        </button>
      </div>

      {!pbOnline && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>PocketBase server offline. Storage uploads will update local state.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Bucket List */}
        <div className="lg:col-span-1 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-4 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-2 pb-1">
            Storage Buckets ({buckets.length})
          </div>
          <div className="space-y-1">
            {buckets.map(bucket => {
              const isSelected = bucket.id === selectedBucket?.id;
              return (
                <button
                  key={bucket.id}
                  onClick={() => setSelectedBucketId(bucket.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ${
                    isSelected 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs' 
                      : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {bucket.public ? <Globe className="w-4 h-4 text-emerald-400 shrink-0" /> : <Lock className="w-4 h-4 text-amber-400 shrink-0" />}
                    <span className="truncate">{bucket.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400">
                    {files.filter(f => f.bucketId === bucket.id).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: File Explorer */}
        <div className="lg:col-span-3 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-zinc-100 font-mono">
                  bucket: {selectedBucket?.name}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${selectedBucket?.public ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                  {selectedBucket?.public ? 'Public Bucket' : 'Private (Secure)'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {bucketFiles.length} files stored · Total size: {selectedBucket?.size}
              </p>
            </div>

            <button
              onClick={handleSimulateUpload}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-medium transition-all flex items-center gap-2 self-start"
            >
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </button>
          </div>

          {/* Files Grid / List */}
          <div className="space-y-3">
            {bucketFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bucketFiles.map(file => (
                  <div key={file.id} className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 flex items-center justify-between gap-4 group hover:border-emerald-500/40 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 rounded-lg bg-zinc-900 text-emerald-400 border border-zinc-800 shrink-0">
                        <File className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-mono font-medium text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">
                          {file.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {file.size} · {file.createdAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyUrl(file.url, file.id)}
                        className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900 rounded-lg transition-colors"
                        title="Copy File URL"
                      >
                        {copiedUrlId === file.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onDeleteFile(file.id)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center text-zinc-400 text-xs font-mono">
                This bucket is empty. Click 'Upload File' to add storage assets.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Bucket Modal */}
      {isBucketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-emerald-400" />
                <span>Create Storage Bucket</span>
              </h3>
              <button 
                onClick={() => setIsBucketModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBucket} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Bucket Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user-uploads, invoices"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="publicBucket"
                  checked={isPublicBucket}
                  onChange={(e) => setIsPublicBucket(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded bg-zinc-950 border border-zinc-800"
                />
                <label htmlFor="publicBucket" className="text-xs text-zinc-300 font-medium">
                  Make bucket public
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBucketModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Create Bucket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
