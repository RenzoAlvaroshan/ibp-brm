import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usersApi, authApi } from '@/api/endpoints'
import { useAuthStore } from '@/store/auth'
import UserAvatar from '@/components/requirements/UserAvatar'
import type { Role } from '@/types'

type Tab = 'profile' | 'team' | 'password'

const ROLE_LABELS: Record<Role, string> = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' }
const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-600',
}

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('profile')

  const isAdmin = user?.role === 'admin'

  // Profile form
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')

  // Password form
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState('viewer')

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => usersApi.list().then(r => r.data),
    enabled: isAdmin,
  })

  const updateProfile = useMutation({
    mutationFn: () => authApi.updateProfile({ full_name: fullName, avatar_url: avatarUrl }),
    onSuccess: (res) => {
      updateUser(res.data)
      toast.success('Profile updated')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  const changePassword = useMutation({
    mutationFn: () => authApi.changePassword({ old_password: oldPassword, new_password: newPassword }),
    onSuccess: () => {
      toast.success('Password changed')
      setOldPassword('')
      setNewPassword('')
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to change password'),
  })

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => usersApi.updateRole(id, role),
    onSuccess: () => {
      toast.success('Role updated')
      queryClient.invalidateQueries({ queryKey: ['users-list'] })
    },
    onError: () => toast.error('Failed to update role'),
  })

  const invite = useMutation({
    mutationFn: () => usersApi.invite({ email: inviteEmail, full_name: inviteName, role: inviteRole }),
    onSuccess: () => {
      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      setInviteName('')
    },
    onError: () => toast.error('Failed to send invitation'),
  })

  const tabs: { id: Tab; label: string; adminOnly?: boolean }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'team', label: 'Team', adminOnly: true },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and workspace settings.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.filter(t => !t.adminOnly || isAdmin).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <UserAvatar user={user} size="lg" />
            <div>
              <p className="font-medium text-gray-900">{user?.full_name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize mt-1 inline-block ${ROLE_COLORS[user?.role || 'viewer']}`}>
                {ROLE_LABELS[user?.role || 'viewer']}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Avatar URL</label>
            <input
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => updateProfile.mutate()}
            disabled={updateProfile.isPending}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Password tab */}
      {tab === 'password' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Change Password</h2>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => oldPassword && newPassword && changePassword.mutate()}
            disabled={!oldPassword || !newPassword || changePassword.isPending}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md disabled:opacity-50"
          >
            {changePassword.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      )}

      {/* Team tab (admin only) */}
      {tab === 'team' && isAdmin && (
        <div className="space-y-4">
          {/* Invite */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Invite Team Member</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  type="email"
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
                <input
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => inviteEmail && inviteName && invite.mutate()}
                  disabled={!inviteEmail || !inviteName || invite.isPending}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md disabled:opacity-50"
                >
                  {invite.isPending ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>

          {/* Users table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">Team Members ({users?.length || 0})</h2>
            </div>
            {usersLoading ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">Loading...</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">User</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users?.map(u => (
                    <tr key={u.id}>
                      <td className="px-5 py-3">
                        <UserAvatar user={u} size="sm" showName />
                      </td>
                      <td className="px-5 py-3 text-gray-500">{u.email}</td>
                      <td className="px-5 py-3">
                        {u.id === user?.id ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role]}`}>
                            {ROLE_LABELS[u.role]} (you)
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={e => updateRole.mutate({ id: u.id, role: e.target.value })}
                            className={`text-xs px-2 py-0.5 rounded-full font-medium border-0 focus:ring-2 focus:ring-indigo-500 ${ROLE_COLORS[u.role]}`}
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
