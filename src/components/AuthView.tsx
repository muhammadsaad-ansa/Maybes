import React, { useState } from 'react';
import { Users, UserPlus, Shield, Key, Lock, CheckCircle2, Ban, Mail, Github, Globe, RefreshCw, LogIn, LogOut, AlertCircle } from 'lucide-react';
import { AuthUser } from '../types';
import { pb } from '../lib/pocketbase';

interface AuthViewProps {
  users: AuthUser[];
  onAddUser: (newUser: AuthUser) => void;
  onUpdateUserStatus: (userId: string, newStatus: 'active' | 'banned') => void;
  pbOnline: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({ users, onAddUser, onUpdateUserStatus, pbOnline }) => {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(pb.authStore.model || null);

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword.trim()) return;

    if (pbOnline) {
      try {
        await pb.collection('users').create({
          email: newEmail.trim(),
          password: newPassword,
          passwordConfirm: newPassword,
          name: newEmail.split('@')[0]
        });
      } catch (err: any) {
        alert(`PocketBase auth signup error: ${err?.message}`);
        return;
      }
    }

    const newUser: AuthUser = {
      id: `u-${Date.now()}`,
      email: newEmail.trim(),
      provider: 'email',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastSignIn: 'Never',
      status: 'active',
      role: 'user'
    };

    onAddUser(newUser);
    setIsAddUserModalOpen(false);
    setNewEmail('');
    setNewPassword('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!pbOnline) {
      setLoginError('PocketBase server is offline. Cannot authenticate against remote server.');
      return;
    }

    try {
      const authData = await pb.collection('users').authWithPassword(loginEmail, loginPassword);
      setCurrentUser(authData.record);
      setIsLoginModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (err: any) {
      setLoginError(err?.message || 'Invalid email or password.');
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>PocketBase Authentication</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {pbOnline ? 'Connected to PocketBase users collection. Test authentication live.' : 'PocketBase server offline. Local demo auth mode.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
              <span className="text-xs font-mono text-emerald-400">Logged in as: {currentUser.email}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium border border-red-500/20 transition-all flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-xl text-xs font-medium transition-all border border-emerald-500/30 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>PocketBase Login</span>
            </button>
          )}

          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register User</span>
          </button>
        </div>
      </div>

      {!pbOnline && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>PocketBase server offline. Authentication API calls require an active PocketBase connection.</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/40">
          <h3 className="text-sm font-semibold text-zinc-200 font-mono">Registered Users ({users.length})</h3>
          <span className="text-xs text-zinc-400 font-mono">PocketBase Auth Collection</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3">User UID</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Provider</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Sign In</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-6 py-3.5 text-zinc-400 font-bold">{user.id}</td>
                  <td className="px-6 py-3.5 text-zinc-200 font-medium">{user.email}</td>
                  <td className="px-6 py-3.5 text-emerald-400 uppercase">{user.provider}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-zinc-800 text-zinc-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-zinc-400">{user.lastSignIn}</td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => onUpdateUserStatus(user.id, user.status === 'active' ? 'banned' : 'active')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                        user.status === 'active' 
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                      }`}
                    >
                      {user.status === 'active' ? 'Ban' : 'Unban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>Register PocketBase User</span>
              </h3>
              <button 
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <LogIn className="w-5 h-5 text-emerald-400" />
                <span>PocketBase Authentication Login</span>
              </h3>
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
