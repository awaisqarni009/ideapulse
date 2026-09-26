'use client';

import React, { useState, useTransition } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  Key,
  Copy,
  Check,
  X,
  RefreshCw,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  adminCreateUserAction,
  adminDeleteUserAction,
  adminUpdateUserRoleAction,
  adminUpdateUserStatusAction,
} from '@/app/actions/admin-management';
import { formatDistanceToNow } from 'date-fns';

export interface UserProfileItem {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  role: 'member' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  ideas_count?: number;
  votes_cast_count?: number;
  votes_received_count?: number;
  cycles_won?: number;
  suspended_until?: string | null;
  suspension_reason?: string | null;
  created_at: string;
}

interface UsersDirectoryManagerProps {
  initialUsers: UserProfileItem[];
  currentAdminId: string;
}

export function UsersDirectoryManager({
  initialUsers,
  currentAdminId,
}: UsersDirectoryManagerProps) {
  const [users, setUsers] = useState<UserProfileItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'member' | 'moderator' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'deleted'>(
    'all',
  );
  const [isPending, startTransition] = useTransition();

  // Add User modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserDisplayName, setNewUserDisplayName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'member' | 'moderator' | 'admin'>('member');
  const [createdCredentials, setCreatedCredentials] = useState<{
    username: string;
    email: string;
    tempPassword: string;
  } | null>(null);

  // Suspend User modal state
  const [suspendTarget, setSuspendTarget] = useState<UserProfileItem | null>(null);
  const [suspendDurationDays, setSuspendDurationDays] = useState(14);
  const [suspendReason, setSuspendReason] = useState('');

  // Delete User modal state
  const [deleteTarget, setDeleteTarget] = useState<UserProfileItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Notification / Alert banner
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchUsername = u.username.toLowerCase().includes(q);
      const matchDisplay = u.display_name?.toLowerCase().includes(q);
      const matchId = u.id.toLowerCase().includes(q);
      return matchUsername || matchDisplay || matchId;
    }
    return true;
  });

  // Handle Create User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserEmail.includes('@')) {
      setAlert({ type: 'error', message: 'A valid email address is required.' });
      return;
    }
    if (!newUserUsername || newUserUsername.trim().length < 3) {
      setAlert({ type: 'error', message: 'Username must be at least 3 characters.' });
      return;
    }

    setAlert(null);
    startTransition(async () => {
      const res = await adminCreateUserAction({
        email: newUserEmail.trim(),
        username: newUserUsername.trim(),
        displayName: newUserDisplayName.trim() || undefined,
        password: newUserPassword.trim() || undefined,
        role: newUserRole,
      });

      if (res.success) {
        const cleanName = newUserUsername.trim().toLowerCase().replace(/^@/, '');
        const newProfile: UserProfileItem = {
          id: 'temp-' + Date.now(),
          username: cleanName,
          display_name: newUserDisplayName.trim() || cleanName,
          role: newUserRole,
          status: 'active',
          ideas_count: 0,
          votes_cast_count: 0,
          votes_received_count: 0,
          cycles_won: 0,
          created_at: new Date().toISOString(),
        };

        setUsers((prev) => [newProfile, ...prev]);

        if (res.temporaryPassword) {
          setCreatedCredentials({
            username: cleanName,
            email: newUserEmail.trim(),
            tempPassword: res.temporaryPassword,
          });
        }

        setAlert({
          type: 'success',
          message: res.message || `User @${cleanName} created successfully!`,
        });

        // Reset form
        setIsAddUserOpen(false);
        setNewUserEmail('');
        setNewUserUsername('');
        setNewUserDisplayName('');
        setNewUserPassword('');
        setNewUserRole('member');
      } else {
        setAlert({ type: 'error', message: res.error || 'Failed to create user.' });
      }
    });
  };

  // Handle Role Change
  const handleRoleChange = (userId: string, newRole: 'member' | 'moderator' | 'admin') => {
    setAlert(null);
    startTransition(async () => {
      const res = await adminUpdateUserRoleAction({
        userId,
        newRole,
        reason: `Role changed to ${newRole} from Users Directory Manager`,
      });

      if (res.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        setAlert({ type: 'success', message: res.message || `Role updated to ${newRole}.` });
      } else {
        setAlert({ type: 'error', message: res.error || 'Failed to update role.' });
      }
    });
  };

  // Handle Suspend Confirm
  const handleConfirmSuspend = () => {
    if (!suspendTarget) return;
    if (!suspendReason || suspendReason.trim().length < 4) {
      setAlert({
        type: 'error',
        message: 'A reason of at least 4 characters is required to suspend an account.',
      });
      return;
    }

    const targetId = suspendTarget.id;
    const targetName = suspendTarget.username;

    setAlert(null);
    startTransition(async () => {
      const res = await adminUpdateUserStatusAction({
        userId: targetId,
        newStatus: 'suspended',
        durationDays: suspendDurationDays,
        reason: suspendReason.trim(),
      });

      if (res.success) {
        const untilDate = new Date(Date.now() + suspendDurationDays * 86400000).toISOString();
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetId
              ? {
                  ...u,
                  status: 'suspended',
                  suspended_until: untilDate,
                  suspension_reason: suspendReason.trim(),
                }
              : u,
          ),
        );
        setAlert({
          type: 'success',
          message:
            res.message || `Account @${targetName} suspended for ${suspendDurationDays} days.`,
        });
        setSuspendTarget(null);
        setSuspendReason('');
      } else {
        setAlert({ type: 'error', message: res.error || 'Failed to suspend user.' });
      }
    });
  };

  // Handle Unsuspend / Activate
  const handleUnsuspend = (userId: string, username: string) => {
    setAlert(null);
    startTransition(async () => {
      const res = await adminUpdateUserStatusAction({
        userId,
        newStatus: 'active',
        reason: 'Restored to active standing by administrator',
      });

      if (res.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, status: 'active', suspended_until: null, suspension_reason: null }
              : u,
          ),
        );
        setAlert({ type: 'success', message: `Account @${username} restored to active status.` });
      } else {
        setAlert({ type: 'error', message: res.error || 'Failed to activate user.' });
      }
    });
  };

  // Handle Delete Confirm
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (!deleteReason || deleteReason.trim().length < 4) {
      setAlert({
        type: 'error',
        message: 'Please provide a written audit reason to remove this account.',
      });
      return;
    }

    const targetId = deleteTarget.id;
    const targetName = deleteTarget.username;

    setAlert(null);
    startTransition(async () => {
      const res = await adminDeleteUserAction({
        userId: targetId,
        reason: deleteReason.trim(),
      });

      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== targetId));
        setAlert({
          type: 'success',
          message: res.message || `User @${targetName} removed from the platform.`,
        });
        setDeleteTarget(null);
        setDeleteReason('');
      } else {
        setAlert({ type: 'error', message: res.error || 'Failed to remove user.' });
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      {alert && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-xs font-medium backdrop-blur-md transition-all ${
            alert.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Created User Credentials Card */}
      {createdCredentials && (
        <div
          className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5 shadow-xl backdrop-blur-md"
          style={{ boxShadow: 'inset 0 1px 0 rgba(16, 185, 129, 0.2)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Key className="h-4 w-4" />
              <h4 className="font-display text-sm font-bold">New Account Credentials Generated</h4>
            </div>
            <button
              onClick={() => setCreatedCredentials(null)}
              className="text-emerald-400/70 hover:text-emerald-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-emerald-200/80">
            Share these login credentials with the user. The password is only shown once here:
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 rounded-xl border border-emerald-500/30 bg-black/40 p-3 font-mono text-xs">
            <div>
              <span className="text-emerald-400/60">Email: </span>
              <strong className="text-white">{createdCredentials.email}</strong>
            </div>
            <div>
              <span className="text-emerald-400/60">Username: </span>
              <strong className="text-white">@{createdCredentials.username}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400/60">Password: </span>
              <strong className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
                {createdCredentials.tempPassword}
              </strong>
              <button
                onClick={() => copyToClipboard(createdCredentials.tempPassword)}
                className="inline-flex items-center gap-1 rounded bg-[var(--surface-3)] px-2 py-1 text-[10px] text-[var(--text-secondary)] hover:text-white"
              >
                {copiedPass ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>{copiedPass ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Header */}
      <div
        className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-xl backdrop-blur-md"
        style={{
          boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.35), inset 0 1px 0 var(--edge-specular)',
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.1)] text-[var(--indigo-bright)]">
                <Users className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                User Directory & Access Control
              </h2>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Manage all community members, promote administrators or moderators, add new users, and
              apply disciplinary suspensions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search username, display name..."
                className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] py-2 pl-9 pr-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--indigo)] focus:outline-none focus:ring-1 focus:ring-[var(--indigo)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Add User Button */}
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-[var(--indigo)] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/40"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Role:
            </span>
            {(['all', 'member', 'moderator', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                  roleFilter === r
                    ? 'bg-[var(--indigo)] text-white'
                    : 'border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                }`}
              >
                {r === 'all' ? 'All Roles' : r}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Status:
            </span>
            {(['all', 'active', 'suspended', 'deleted'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                  statusFilter === s
                    ? 'border border-[var(--border-default)] bg-[var(--surface-3)] text-white'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table / Grid */}
      <div
        className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] shadow-xl backdrop-blur-md"
        style={{
          boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.35), inset 0 1px 0 var(--edge-specular)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-2)]/50 border-b border-[var(--border-subtle)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              <tr>
                <th className="px-5 py-3.5">User Identity</th>
                <th className="px-4 py-3.5">Assigned Role</th>
                <th className="px-4 py-3.5">Account Status</th>
                <th className="px-4 py-3.5">Platform Activity</th>
                <th className="px-4 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[var(--text-tertiary)]">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((userItem) => {
                  const isSelf = userItem.id === currentAdminId;
                  const isSuspended = userItem.status === 'suspended';
                  const isDeleted = userItem.status === 'deleted';

                  return (
                    <tr
                      key={userItem.id}
                      className="hover:bg-[var(--surface-2)]/40 transition-colors"
                    >
                      {/* Identity */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-3)] font-mono text-xs font-bold text-[var(--text-primary)]">
                            {userItem.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[var(--text-primary)]">
                                {userItem.display_name || userItem.username}
                              </span>
                              {isSelf && (
                                <span className="bg-[var(--indigo)]/20 py-0.2 rounded px-1.5 text-[9px] font-bold text-[var(--indigo-bright)]">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[11px] text-[var(--text-tertiary)]">
                              @{userItem.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Dropdown */}
                      <td className="px-4 py-4">
                        {isSelf ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-1 text-[11px] font-bold text-purple-400">
                            <ShieldCheck className="h-3 w-3" />
                            Admin
                          </span>
                        ) : (
                          <select
                            value={userItem.role}
                            onChange={(e) =>
                              handleRoleChange(
                                userItem.id,
                                e.target.value as 'member' | 'moderator' | 'admin',
                              )
                            }
                            disabled={isPending}
                            className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)] focus:border-[var(--indigo)] focus:outline-none disabled:opacity-50"
                          >
                            <option value="member">Member</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Administrator</option>
                          </select>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {userItem.status === 'active' && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        )}
                        {userItem.status === 'suspended' && (
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
                              <ShieldAlert className="h-3 w-3" />
                              Suspended
                            </span>
                            {userItem.suspended_until && (
                              <div className="mt-0.5 text-[10px] text-[var(--text-tertiary)]">
                                Until {new Date(userItem.suspended_until).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                        {userItem.status === 'deleted' && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-400">
                            <XCircle className="h-3 w-3" />
                            Deleted
                          </span>
                        )}
                      </td>

                      {/* Activity */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)]">
                          <div>
                            <strong className="text-[var(--text-primary)]">
                              {userItem.ideas_count ?? 0}
                            </strong>{' '}
                            ideas
                          </div>
                          <div>
                            <strong className="text-[var(--cyan-bright)]">
                              {userItem.votes_cast_count ?? 0}
                            </strong>{' '}
                            votes
                          </div>
                          {Boolean(userItem.cycles_won) && (
                            <span className="rounded bg-amber-500/20 px-1 py-0.5 font-bold text-amber-300">
                              🏆 {userItem.cycles_won} won
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-4 text-[11px] text-[var(--text-tertiary)]">
                        {formatDistanceToNow(new Date(userItem.created_at), { addSuffix: true })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {!isSelf && (
                          <div className="flex items-center justify-end gap-2">
                            {isSuspended ? (
                              <button
                                onClick={() => handleUnsuspend(userItem.id, userItem.username)}
                                disabled={isPending}
                                className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-600 hover:text-white disabled:opacity-50"
                              >
                                Restore
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSuspendTarget(userItem);
                                  setSuspendReason('');
                                }}
                                disabled={isPending || isDeleted}
                                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-600 hover:text-white disabled:opacity-50"
                              >
                                Suspend
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setDeleteTarget(userItem);
                                setDeleteReason('');
                              }}
                              disabled={isPending}
                              className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-600 hover:text-white disabled:opacity-50"
                              title="Remove / Delete User"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New User Modal Dialog */}
      {isAddUserOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-2xl backdrop-blur-xl"
            style={{
              boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 var(--edge-specular)',
            }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2 text-[var(--indigo-bright)]">
                <UserPlus className="h-5 w-5" />
                <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                  Add New Platform User
                </h3>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="rounded-lg p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="mt-1 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--indigo)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                  Username * (3-24 characters, letters/numbers/underscores)
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[var(--text-tertiary)]">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={newUserUsername}
                    onChange={(e) =>
                      setNewUserUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                    placeholder="alex_dev"
                    maxLength={24}
                    className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] py-2 pl-7 pr-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--indigo)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                  Display Name (optional)
                </label>
                <input
                  type="text"
                  value={newUserDisplayName}
                  onChange={(e) => setNewUserDisplayName(e.target.value)}
                  placeholder="Alex Rivers"
                  maxLength={48}
                  className="mt-1 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--indigo)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                  Initial Password (optional)
                </label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Leave empty to auto-generate secure password"
                  className="mt-1 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--indigo)] focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-[var(--text-tertiary)]">
                  If left empty, a secure password will be generated for you to copy.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                  Initial Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) =>
                    setNewUserRole(e.target.value as 'member' | 'moderator' | 'admin')
                  }
                  className="mt-1 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] focus:border-[var(--indigo)] focus:outline-none"
                >
                  <option value="member">Member (Regular voter & submitter)</option>
                  <option value="moderator">Moderator (Queue moderation access)</option>
                  <option value="admin">Administrator (Full console privileges)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  disabled={isPending}
                  className="rounded-xl border border-[var(--border-default)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/50 bg-[var(--indigo)] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating User...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend User Modal Dialog */}
      {suspendTarget && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-2xl backdrop-blur-xl"
            style={{
              boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 var(--edge-specular)',
            }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                  Suspend User Account
                </h3>
              </div>
              <button
                onClick={() => setSuspendTarget(null)}
                className="rounded-lg p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Target Account
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-[var(--text-primary)]">
                  @{suspendTarget.username}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                  Suspension Duration
                </label>
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  {[7, 14, 30, 90].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSuspendDurationDays(d)}
                      className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                        suspendDurationDays === d
                          ? 'bg-amber-500 text-white'
                          : 'border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                  Audit Reason (Required):
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Vote manipulation ring participation, repeated spam proposals, or abusive conduct..."
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-300">
                Rule BR-004: All active votes cast by this user will be immediately marked as
                unverified (voided from threshold counts) during suspension.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSuspendTarget(null)}
                  disabled={isPending}
                  className="rounded-xl border border-[var(--border-default)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSuspend}
                  disabled={isPending || suspendReason.trim().length < 4}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-500 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldAlert className="h-3.5 w-3.5" />
                  )}
                  <span>Apply Suspension</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal Dialog */}
      {deleteTarget && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-2xl backdrop-blur-xl"
            style={{
              boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 var(--edge-specular)',
            }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2 text-rose-400">
                <Trash2 className="h-5 w-5" />
                <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                  Remove User Account
                </h3>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Target Account
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-[var(--text-primary)]">
                  @{deleteTarget.username} ({deleteTarget.display_name})
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">ID: {deleteTarget.id}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                  Written Audit Reason (Required):
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g. Account owner request, permanent spam bot cleanup..."
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[11px] text-rose-300">
                This will revoke authentication credentials and remove or deactivate the user
                profile. This action is permanently logged to the system audit trail.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isPending}
                  className="rounded-xl border border-[var(--border-default)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isPending || deleteReason.trim().length < 4}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/50 bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>Permanently Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
