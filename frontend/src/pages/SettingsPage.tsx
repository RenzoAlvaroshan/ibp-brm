import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usersApi, authApi } from '@/api/endpoints'
import { useAuthStore } from '@/store/auth'
import { useDemoStore } from '@/store/demo'
import UserAvatar from '@/components/requirements/UserAvatar'
import type { Role } from '@/types'
import { Zap, User, Lock, Users, Tag, AppWindow } from 'lucide-react'
import TagsPage from './TagsPage'
import AppsPage from './AppsPage'

type Tab = 'profile' | 'team' | 'password' | 'tags' | 'apps'

const ROLE_LABELS: Record<Role, string> = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' }
const ROLE_COLORS: Record<Role, string> = {
  admin:  'bg-violet-100 text-violet-700 border border-violet-200',
  editor: 'bg-blue-100 text-blue-700 border border-blue-200',
  viewer: 'bg-gray-100 text-gray-600 border border-gray-200',
}

function DemoNotice() {
  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-[13px] text-amber-700">
      <Zap size={15} className="mt-0.5 shrink-0 fill-amber-400" />
      <div>
        <p className="font-semibold">Demo mode active</p>
        <p className="text-[12px] text-amber-600 mt-0.5">Profile changes and password updates are disabled in demo mode.</p>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('profile')

  const isAdmin = user?.role === 'admin'

  const [fullName, setFullName] = useState(user?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState('viewer')

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => usersApi.list().then((r) => r.data),
    enabled: isAdmin && !isDemoMode,
  })

  const updateProfile = useMutation({
    mutationFn: () => authApi.updateProfile({ full_name: fullName, avatar_url: avatarUrl }),
    onSuccess: (res) => { updateUser(res.data); toast.success('Profile updated') },
    onError: () => toast.error('Failed to update profile'),
  })

  const changePassword = useMutation({
    mutationFn: () => authApi.changePassword({ old_password: oldPassword, new_password: newPassword }),
    onSuccess: () => { toast.success('Password changed'); setOldPassword(''); setNewPassword('') },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to change password'),
  })

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => usersApi.updateRole(id, role),
    onSuccess: () => { toast.success('Role updated'); queryClient.invalidateQueries({ queryKey: ['users-list'] }) },
    onError: () => toast.error('Failed to update role'),
  })

  const invite = useMutation({
    mutationFn: () => usersApi.invite({ email: inviteEmail, full_name: inviteName, role: inviteRole }),
    onSuccess: () => { toast.success(`Invitation sent to ${inviteEmail}`); setInviteEmail(''); setInviteName('') },
    onError: () => toast.error('Failed to send invitation'),
  })

  const tabs: { id: Tab; label: string; icon: typeof User; adminOnly?: boolean }[] = [
    { id: 'profile',  label: 'Profile',  icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'team',     label: 'Team',     icon: Users,     adminOnly: true },
    { id: 'tags',     label: 'Tags',     icon: Tag,       adminOnly: true },
    { id: 'apps',     label: 'Apps',     icon: AppWindow, adminOnly: true },
  ]

  const inputCls = 'w-full px-3 py-2 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all'
  const labelCls = 'text-[12px] font-medium text-gray-600 block mb-1.5'
  const btnCls   = 'px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-medium rounded-md disabled:opacity-50 transition-colors shadow-sm shadow-violet-600/20'

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-[18px] font-semibold text-gray-900">Settings</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Manage your account and workspace.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.filter((t) => !t.adminOnly || isAdmin).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-all ${
              tab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          {isDemoMode && <DemoNotice />}

          <div className="flex items-center gap-4 pb-2">
            <UserAvatar user={user} size="lg" />
            <div>
              <p className="font-semibold text-gray-900 text-[15px]">{user?.full_name}</p>
              <p className="text-[13px] text-gray-500">{user?.email}</p>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize mt-1 inline-block ${ROLE_COLORS[user?.role || 'viewer']}`}>
                {ROLE_LABELS[user?.role || 'viewer']}
              </span>
            </div>
          </div>

          <div>
            <label className={labelCls}>Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} disabled={isDemoMode} />
          </div>
          <div>
            <label className={labelCls}>Avatar URL</label>
            <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className={inputCls} disabled={isDemoMode} />
          </div>

          <button
            onClick={() => !isDemoMode && updateProfile.mutate()}
            disabled={updateProfile.isPending || isDemoMode}
            className={btnCls}
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Password tab */}
      {tab === 'password' && (
        <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          {isDemoMode && <DemoNotice />}
          <h2 className="text-[14px] font-semibold text-gray-800">Change Password</h2>
          <div>
            <label className={labelCls}>Current Password</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className={inputCls} disabled={isDemoMode} />
          </div>
          <div>
            <label className={labelCls}>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} disabled={isDemoMode} />
          </div>
          <button
            onClick={() => !isDemoMode && oldPassword && newPassword && changePassword.mutate()}
            disabled={!oldPassword || !newPassword || changePassword.isPending || isDemoMode}
            className={btnCls}
          >
            {changePassword.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      )}

      {/* Tags tab */}
      {tab === 'tags' && isAdmin && <TagsPage />}

      {/* Apps tab */}
      {tab === 'apps' && isAdmin && <AppsPage />}

      {/* Team tab */}
      {tab === 'team' && isAdmin && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
            <h2 className="text-[14px] font-semibold text-gray-800 mb-4">Invite Team Member</h2>
            {isDemoMode && <div className="mb-4"><DemoNotice /></div>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Email</label>
                <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} type="email" placeholder="user@example.com" className={inputCls} disabled={isDemoMode} />
              </div>
              <div>
                <label className={labelCls}>Full Name</label>
                <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="John Doe" className={inputCls} disabled={isDemoMode} />
              </div>
              <div>
                <label className={labelCls}>Role</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className={inputCls} disabled={isDemoMode}>
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => !isDemoMode && inviteEmail && inviteName && invite.mutate()}
                  disabled={!inviteEmail || !inviteName || invite.isPending || isDemoMode}
                  className={`w-full ${btnCls}`}
                >
                  {invite.isPending ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Users size={14} className="text-gray-400" />
              <h2 className="text-[13px] font-semibold text-gray-700">Team Members</h2>
              {isDemoMode ? (
                <span className="ml-auto text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">demo data</span>
              ) : (
                <span className="ml-auto text-[12px] text-gray-400">{users?.length || 0} members</span>
              )}
            </div>

            {isDemoMode ? (
              <div className="px-5 py-6 text-center text-[13px] text-gray-400">
                <Users size={24} className="mx-auto mb-2 text-gray-200" />
                Team management is not available in demo mode
              </div>
            ) : usersLoading ? (
              <div className="px-5 py-8 text-center text-[13px] text-gray-400">Loading...</div>
            ) : (
              <table className="w-full text-[13px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">User</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users?.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3"><UserAvatar user={u} size="sm" showName /></td>
                      <td className="px-5 py-3 text-gray-500">{u.email}</td>
                      <td className="px-5 py-3">
                        {u.id === user?.id ? (
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role]}`}>
                            {ROLE_LABELS[u.role]} (you)
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value })}
                            className={`text-[11px] px-2 py-0.5 rounded-full font-medium border-0 focus:ring-2 focus:ring-violet-500 ${ROLE_COLORS[u.role]}`}
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
