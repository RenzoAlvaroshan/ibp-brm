import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { tagsApi } from '@/api/endpoints'
import { TAG_PALETTE } from '@/utils'
import { useAuthStore } from '@/store/auth'

export default function TagsPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const canManage = user?.role === 'admin' || user?.role === 'editor'

  const [name, setName] = useState('')
  const [color, setColor] = useState(TAG_PALETTE[0])

  const { data: tags, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.list().then(r => r.data),
  })

  const createTag = useMutation({
    mutationFn: () => tagsApi.create({ name: name.trim(), color }),
    onSuccess: () => {
      toast.success('Tag created')
      setName('')
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to create tag'),
  })

  const deleteTag = useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      toast.success('Tag deleted')
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
    onError: () => toast.error('Failed to delete tag'),
  })

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Tags</h1>
        <p className="text-sm text-gray-500 mt-1">Create and manage tags to categorize requirements.</p>
      </div>

      {/* Create tag form */}
      {canManage && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Create Tag</h2>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">Tag name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Frontend, Security..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={e => e.key === 'Enter' && name.trim() && createTag.mutate()}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Color</label>
              <div className="flex flex-wrap gap-1.5 w-48">
                {TAG_PALETTE.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? '#1F2937' : 'transparent',
                      transform: color === c ? 'scale(1.2)' : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => name.trim() && createTag.mutate()}
              disabled={!name.trim() || createTag.isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md disabled:opacity-50"
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {/* Preview */}
          {name && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Preview:</p>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: color + '20', color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                {name}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tags list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">All Tags ({tags?.length || 0})</h2>
        </div>
        {isLoading ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : !tags?.length ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">No tags yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: tag.color + '20', color: tag.color }}
                  >
                    {tag.name}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{tag.color}</span>
                </div>
                {canManage && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete tag "${tag.name}"?`)) deleteTag.mutate(tag.id)
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Trash2 size={14} />
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
