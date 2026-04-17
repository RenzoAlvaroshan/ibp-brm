import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2, Tag as TagIcon } from 'lucide-react'
import { useTagsQuery, useCreateTag, useDeleteTag } from '@/hooks/useApi'
import { TAG_PALETTE } from '@/utils'
import { useAuthStore } from '@/store/auth'
import { useDemoStore } from '@/store/demo'

export default function TagsPage() {
  const { user } = useAuthStore()
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const canManage = user?.role === 'admin' || user?.role === 'editor'

  const [name, setName] = useState('')
  const [color, setColor] = useState(TAG_PALETTE[0])

  const tagsQuery = useTagsQuery()
  const { data: tags, isLoading } = useQuery(tagsQuery)

  const createTagFn = useCreateTag()
  const deleteTagFn = useDeleteTag()

  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      await createTagFn({ name: name.trim(), color })
      toast.success('Tag created')
      setName('')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to create tag')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, tagName: string) => {
    if (!confirm(`Delete tag "${tagName}"?`)) return
    setDeletingId(id)
    try {
      await deleteTagFn(id)
      toast.success('Tag deleted')
    } catch {
      toast.error('Failed to delete tag')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-[18px] font-semibold text-gray-900">Tags</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Create and manage tags to categorize requirements.</p>
      </div>

      {/* Create form */}
      {canManage && (
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <h2 className="text-[13px] font-semibold text-gray-700 mb-4">New Tag</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Frontend, Security..."
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Color</label>
                <div
                  className="w-8 h-[38px] rounded-md border-2 border-gray-200 cursor-pointer transition-all"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    const next = TAG_PALETTE[(TAG_PALETTE.indexOf(color) + 1) % TAG_PALETTE.length]
                    setColor(next)
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Pick a color</label>
              <div className="flex flex-wrap gap-1.5">
                {TAG_PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full transition-all hover:scale-110"
                    style={{
                      backgroundColor: c,
                      outline: color === c ? `2px solid ${c}` : 'none',
                      outlineOffset: '2px',
                      transform: color === c ? 'scale(1.2)' : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            {name && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">Preview:</span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium"
                  style={{ backgroundColor: color + '18', color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {name}
                </span>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-medium rounded-md disabled:opacity-50 transition-colors shadow-sm shadow-violet-600/20"
            >
              <Plus size={14} />
              {creating ? 'Creating...' : 'Create Tag'}
            </button>
          </div>
        </div>
      )}

      {/* Tags list */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
          <TagIcon size={14} className="text-gray-400" />
          <h2 className="text-[13px] font-semibold text-gray-700">All Tags</h2>
          <span className="ml-auto text-[12px] text-gray-400">{tags?.length || 0} tags</span>
        </div>

        {isLoading ? (
          <div className="px-5 py-8 text-center text-[13px] text-gray-400">Loading tags...</div>
        ) : !tags?.length ? (
          <div className="px-5 py-10 text-center">
            <TagIcon size={28} className="mx-auto mb-2 text-gray-200" />
            <p className="text-[13px] text-gray-400">No tags yet</p>
            {canManage && <p className="text-[12px] text-gray-400 mt-0.5">Create your first tag above</p>}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium"
                    style={{ backgroundColor: tag.color + '18', color: tag.color }}
                  >
                    {tag.name}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono hidden sm:block">{tag.color}</span>
                </div>
                {canManage && (
                  <button
                    onClick={() => handleDelete(tag.id, tag.name)}
                    disabled={deletingId === tag.id}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
