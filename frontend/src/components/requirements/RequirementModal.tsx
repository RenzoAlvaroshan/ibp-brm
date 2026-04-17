import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import type { Requirement, Status, Priority } from '@/types'
import { useTagsQuery, useUsersQuery, useCreateRequirement, useUpdateRequirement } from '@/hooks/useApi'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['draft', 'review', 'approved', 'rejected']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
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
  const isEdit   = !!requirement
  const createReq = useCreateRequirement()
  const updateReq = useUpdateRequirement()

  const tagsQuery  = useTagsQuery()
  const usersQuery = useUsersQuery()
  const { data: tags }  = useQuery(tagsQuery)
  const { data: users } = useQuery(usersQuery)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:           requirement?.title || '',
      description:     requirement?.description || '',
      status:          (requirement?.status || defaultStatus || 'draft') as Status,
      priority:        (requirement?.priority || 'medium') as Priority,
      assigned_to_id:  requirement?.assigned_to_id || '',
      due_date:        requirement?.due_date ? requirement.due_date.split('T')[0] : '',
    },
  })

  const [selectedTags, setSelectedTags] = useState<string[]>(requirement?.tags?.map((t) => t.id) || [])
  const [saving, setSaving] = useState(false)

  const toggleTag = (id: string) =>
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id])

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

  const inputCls  = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all'
  const labelCls  = 'text-[12px] font-medium text-gray-600 block mb-1.5'
  const selectCls = `${inputCls} bg-white`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[560px] max-h-[90vh] flex flex-col animate-scale-in border border-gray-200/80 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900">
            {isEdit ? 'Edit Requirement' : 'New Requirement'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Title */}
            <div>
              <label className={labelCls}>Title <span className="text-red-400">*</span></label>
              <input {...register('title')} className={inputCls} placeholder="Enter requirement title..." />
              {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Describe the requirement in detail..."
              />
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Status</label>
                <select {...register('status')} className={selectCls}>
                  <option value="draft">Draft</option>
                  <option value="review">Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Priority</label>
                <select {...register('priority')} className={selectCls}>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Assignee + Due date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Assignee</label>
                <select {...register('assigned_to_id')} className={selectCls}>
                  <option value="">Unassigned</option>
                  {users?.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Due Date</label>
                <input {...register('due_date')} type="date" className={inputCls} />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className={labelCls}>Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {tags?.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border transition-all duration-150"
                    style={{
                      borderColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color + '18' : '#f9fafb',
                      color: selectedTags.includes(tag.id) ? tag.color : '#6b7280',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </button>
                ))}
                {!tags?.length && (
                  <p className="text-[12px] text-gray-400">No tags yet. Create them in the Tags page.</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium border border-gray-200 rounded-lg hover:bg-white transition-colors text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-[13px] font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg disabled:opacity-50 transition-colors shadow-sm shadow-violet-600/20"
            >
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
