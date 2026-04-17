import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2, Pencil, Users, X, Check } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import {
  useAppsQuery, useCreateApp, useUpdateApp, useDeleteApp,
  useAddAppUser, useRemoveAppUser, useUsersQuery,
} from '@/hooks/useApi'
import type { App } from '@/types'

export default function AppsPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingApp, setEditingApp] = useState<App | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [managingApp, setManagingApp] = useState<App | null>(null)

  const appsQuery = useAppsQuery()
  const { data: apps = [], isLoading } = useQuery(appsQuery)

  const usersQuery = useUsersQuery()
  const { data: users = [] } = useQuery(usersQuery)

  const createApp = useCreateApp()
  const updateApp = useUpdateApp()
  const deleteApp = useDeleteApp()
  const addAppUser = useAddAppUser()
  const removeAppUser = useRemoveAppUser()

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      await createApp({ name: name.trim(), description: description.trim() })
      toast.success('App created')
      setName('')
      setDescription('')
    } catch {
      toast.error('Failed to create app')
    }
  }

  const handleUpdate = async () => {
    if (!editingApp || !editName.trim()) return
    try {
      await updateApp(editingApp.id, { name: editName.trim(), description: editDesc.trim() })
      toast.success('App updated')
      setEditingApp(null)
    } catch {
      toast.error('Failed to update app')
    }
  }

  const handleDelete = async (app: App) => {
    if (!confirm(`Delete app "${app.name}"?`)) return
    try {
      await deleteApp(app.id)
      toast.success('App deleted')
      if (managingApp?.id === app.id) setManagingApp(null)
    } catch {
      toast.error('Failed to delete app')
    }
  }

  const handleAddUser = async (userId: string) => {
    if (!managingApp) return
    try {
      const updated = await addAppUser(managingApp.id, userId)
      setManagingApp(updated)
      toast.success('User added')
    } catch {
      toast.error('Failed to add user')
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!managingApp) return
    try {
      const updated = await removeAppUser(managingApp.id, userId)
      setManagingApp(updated)
      toast.success('User removed')
    } catch {
      toast.error('Failed to remove user')
    }
  }

  // Keep the managing app in sync with latest data
  const currentManagingApp = managingApp
    ? (apps.find((a) => a.id === managingApp.id) ?? managingApp)
    : null

  const assignedUserIds = new Set(currentManagingApp?.users?.map((u) => u.id) ?? [])

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Applications</h1>
        <p className="text-sm text-gray-500 mt-1">Manage apps that can be linked to tasks and assigned to users.</p>
      </div>

      {/* Create form — admin only */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Add Application</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SCOne, EAI…"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description…"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md disabled:opacity-50"
              >
                <Plus size={14} /> Add App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apps list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">All Applications ({apps.length})</h2>
        </div>

        {isLoading ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : !apps.length ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">No apps yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {apps.map((app) => (
              <div key={app.id}>
                {/* Row */}
                <div className="flex items-center justify-between px-5 py-3 gap-3">
                  {editingApp?.id === app.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-indigo-400 rounded-md focus:outline-none"
                        autoFocus
                      />
                      <input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="flex-[2] px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none"
                        placeholder="Description"
                      />
                      <button onClick={handleUpdate} className="p-1 text-green-600 hover:text-green-700"><Check size={15} /></button>
                      <button onClick={() => setEditingApp(null)} className="p-1 text-gray-400 hover:text-gray-600"><X size={15} /></button>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{app.name}</p>
                      {app.description && <p className="text-xs text-gray-500 truncate">{app.description}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{app.users?.length || 0} user{app.users?.length !== 1 ? 's' : ''}</p>
                    </div>
                  )}

                  {isAdmin && editingApp?.id !== app.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setManagingApp(managingApp?.id === app.id ? null : app)
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          managingApp?.id === app.id
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <Users size={13} /> Users
                      </button>
                      <button
                        onClick={() => { setEditingApp(app); setEditName(app.name); setEditDesc(app.description) }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(app)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* User assignment panel */}
                {managingApp?.id === app.id && (
                  <div className="bg-gray-50 border-t border-gray-100 px-5 py-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Assigned Users</p>
                    <div className="space-y-2">
                      {users.map((u) => {
                        const assigned = assignedUserIds.has(u.id)
                        return (
                          <div key={u.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-800">{u.full_name}</p>
                              <p className="text-xs text-gray-400">{u.email} · {u.role}</p>
                            </div>
                            <button
                              onClick={() => assigned ? handleRemoveUser(u.id) : handleAddUser(u.id)}
                              className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                                assigned
                                  ? 'bg-indigo-100 text-indigo-700 hover:bg-red-100 hover:text-red-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700'
                              }`}
                            >
                              {assigned ? 'Remove' : 'Add'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
