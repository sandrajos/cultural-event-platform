import React, { useState, useCallback, useEffect } from 'react';
import { Shield, Users, Activity, Edit, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, updateUserRole, getAuditLogs } from '@/services/api';
import type { Profile, AuditLog } from '@/types/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Navigate } from 'react-router-dom';

const roleColors = { admin: 'text-accent font-black', organizer: 'text-blue-600 font-semibold', visitor: 'text-muted-foreground' };

function UserRow({ user, onRoleChange }: { user: Profile; onRoleChange: (id: string, role: string) => Promise<void> }) {
  const { profile: currentUser } = useAuth();
  const [updating, setUpdating] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    setUpdating(true);
    await onRoleChange(user.id, newRole);
    setUpdating(false);
  };

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="font-semibold text-sm">{user.username}</div>
        {user.full_name && <div className="text-xs text-muted-foreground">{user.full_name}</div>}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{user.email ?? '—'}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`text-sm ${roleColors[user.role] ?? 'text-muted-foreground'}`}>{user.role}</span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{format(new Date(user.created_at), 'MMM d, yyyy')}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        {user.id !== currentUser?.id ? (
          <Select defaultValue={user.role} onValueChange={handleRoleChange} disabled={updating}>
            <SelectTrigger className="h-7 w-32 text-xs border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visitor">Visitor</SelectItem>
              <SelectItem value="organizer">Organizer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className="text-xs text-muted-foreground italic">You</span>
        )}
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const { role } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, logsData] = await Promise.all([getUsers(0, 50), getAuditLogs(0, 50)]);
      setUsers(usersData.users);
      setUsersTotal(usersData.total);
      setLogs(logsData.logs);
      setLogsTotal(logsData.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (id: string, newRole: string) => {
    try { await updateUserRole(id, newRole); setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole as Profile['role'] } : u)); toast.success('Role updated'); }
    catch { toast.error('Failed to update role'); }
  };

  if (role !== 'admin') return <Navigate to="/" replace />;

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield size={28} className="text-accent" />
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">Manage users and view activity logs</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: usersTotal },
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length },
            { label: 'Organizers', value: users.filter(u => u.role === 'organizer').length },
            { label: 'Visitors', value: users.filter(u => u.role === 'visitor').length },
          ].map(s => (
            <Card key={s.label} className="brutalist-card">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
                <p className="text-3xl font-black">{loading ? '—' : s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6 border border-border bg-transparent h-auto p-0 gap-0">
            <TabsTrigger value="users" className="border-r border-border px-4 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none">
              <Users size={14} className="mr-2" />Users ({usersTotal})
            </TabsTrigger>
            <TabsTrigger value="logs" className="px-4 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none">
              <Activity size={14} className="mr-2" />Audit Logs ({logsTotal})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {loading ? <Skeleton className="h-64 bg-muted" /> : (
              <Card className="brutalist-card">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">User Management</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-border">
                        {['Username', 'Email', 'Role', 'Joined', 'Change Role'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>{users.map(u => <UserRow key={u.id} user={u} onRoleChange={handleRoleChange} />)}</tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="logs">
            {loading ? <Skeleton className="h-64 bg-muted" /> : (
              <Card className="brutalist-card">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Activity History</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {logs.length === 0 ? (
                    <div className="p-12 text-center">
                      <Activity size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No activity logs yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-border">
                          {['Time', 'User', 'Action', 'Entity', 'ID'].map(h => (
                            <th key={h} className="text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {logs.map(log => (
                            <tr key={log.id} className="border-b border-border hover:bg-muted/30">
                              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{format(new Date(log.created_at), 'MMM d, h:mm a')}</td>
                              <td className="px-4 py-3 text-sm whitespace-nowrap">{log.user?.username ?? 'System'}</td>
                              <td className="px-4 py-3 whitespace-nowrap"><span className="text-xs border border-border px-2 py-0.5 font-mono">{log.action}</span></td>
                              <td className="px-4 py-3 text-sm capitalize whitespace-nowrap">{log.entity_type}</td>
                              <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{log.entity_id?.slice(0, 8) ?? '—'}…</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
