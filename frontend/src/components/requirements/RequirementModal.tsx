import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import type { Requirement } from '@/types'
import { useTagsQuery, useUsersQuery, useCreateRequirement, useUpdateRequirement } from '@/hooks/useApi'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assigned_to_id: z.string().optional(),
  due_date: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  onClose: () => void
  requirement?: Requirement
  defaultStatus?: string
}

export default function RequirementModal({ onClose, requirement, defaultStatus }: Props) {
  const isEdit = !!requirement
  const createReq = useCreateRequirement()
  const updateReq = useUpdateRequirement()

  const tagsQuery = useTagsQuery()
  const usersQuery = useUsersQuery()
  const { data: tags } = useQuery(tagsQuery)
  const { data: users } = useQuery(usersQuery)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: requirement?.title || '',
      description: requirement?.description || '',
      status: requirement?.status || defaultStatus || 'draft',
      priority: requirement?.priority || 'medium',
      assigned_to_id: requirement?.assigned_to_id || '',
      due_date: requirement?.due_date ? requirement.due_date.split('T')[0] : '',
    },
  })

  const [selectedTags, setSelectedTags] = useState<string[]>(requirement?.tags?.map((t) => t.id) || [])
  const [saving, setSaving] = useState(false)

  const toggleTag = (id: string) =>
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = { ...data, tag_ids: selectedTags }
      if (isEdit) {
        await updateReq(requirement.id, payload)
        toast.success('Requirement updated')
      } else {
        await createReq(payload)
        toast.success('Requirement created')
      }
      onClose()
    } catch {
      toast.error('Failed to save requirement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Requirement' : 'New Requirement'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Title *</label>
              <input {...register('title')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Requirement title..." />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
              <textarea {...register('description')} rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Describe the requirement..." />
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
                <select {...register('status')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="draft">Draft</option>
                  <option value="review">Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Priority</label>
                <select {...register('priority')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Assignee + Due date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Assignee</label>
                <select {...register('assigned_to_id')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Unassigned</option>
                  {users?.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Due Date</label>
                <input {...register('due_date')} type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border-2 transition-all"
                    style={{
                      borderColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color + '20' : '#F3F4F6',
                      color: selectedTags.includes(tag.id) ? tag.color : '#6B7280',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </button>
                ))}
                {!tags?.length && <p className="text-xs text-gray-400">No tags yet. Create them in the Tags page.</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md disabled:opacity-50">
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
