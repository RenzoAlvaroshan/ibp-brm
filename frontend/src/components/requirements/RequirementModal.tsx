import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { X, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { Requirement, Status, Priority } from '@/types'
import { useTagsQuery, useUsersQuery, useCreateRequirement, useUpdateRequirement } from '@/hooks/useApi'
import { SingleSelect, UserSelect } from '@/components/ui/Select'
import { cn } from '@/utils'

const schema = z.object({
  title:          z.string().min(1, 'Title is required'),
  description:    z.string().optional(),
  status:         z.enum(['todo', 'requirement_gathering', 'development', 'sit', 'uat', 'd2p', 'production_test', 'completed']).optional(),
  priority:       z.enum(['critical', 'high', 'medium', 'low']).optional(),
  assigned_to_id: z.string().optional(),
  due_date:       z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  onClose: () => void
  requirement?: Requirement
  defaultStatus?: Status
}

const STATUS_OPTIONS = [
  { value: 'todo',                  label: 'To Do',           dot: '#9ca3af' },
  { value: 'requirement_gathering', label: 'Req. Gathering',  dot: '#3b82f6' },
  { value: 'development',           label: 'Development',     dot: '#6366f1' },
  { value: 'sit',                   label: 'SIT',             dot: '#f59e0b' },
  { value: 'uat',                   label: 'UAT',             dot: '#8b5cf6' },
  { value: 'd2p',                   label: 'D2P',             dot: '#ec4899' },
  { value: 'production_test',       label: 'Production Test', dot: '#f97316' },
  { value: 'completed',             label: 'Completed',       dot: '#10b981' },
]

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', dot: '#ef4444' },
  { value: 'high',     label: 'High',     dot: '#f97316' },
  { value: 'medium',   label: 'Medium',   dot: '#3b82f6' },
  { value: 'low',      label: 'Low',      dot: '#9ca3af' },
]

export default function RequirementModal({ onClose, requirement, defaultStatus }: Props) {
  const isEdit    = !!requirement
  const createReq = useCreateRequirement()
  const updateReq = useUpdateRequirement()

  const tagsQuery  = useTagsQuery()
  const usersQuery = useUsersQuery()
  const { data: tags }  = useQuery(tagsQuery)
  const { data: users } = useQuery(usersQuery)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:          requirement?.title || '',
      description:    requirement?.description || '',
      status:         (requirement?.status || defaultStatus || 'todo') as Status,
      priority:       (requirement?.priority || 'medium') as Priority,
      assigned_to_id: requirement?.assigned_to_id || '',
      due_date:       requirement?.due_date ? requirement.due_date.split('T')[0] : '',
    },
  })

  const status         = watch('status') || 'todo'
  const priority       = watch('priority') || 'medium'
  const assigned_to_id = watch('assigned_to_id') || ''

  const [selectedTags, setSelectedTags] = useState<string[]>(requirement?.tags?.map((t) => t.id) || [])
  const [saving, setSaving] = useState(false)

  const toggleTag = (id: string) =>
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id])

  const onSubmit = async (data: FormValues) => {
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

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all placeholder:text-gray-400'
  const labelCls = 'text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px] animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 w-full max-w-[540px] max-h-[90vh] flex flex-col animate-scale-in border border-gray-200/60 mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">
              {isEdit ? 'Edit Requirement' : 'New Requirement'}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isEdit ? 'Update the fields below' : 'Fill in the details to create a new requirement'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            {/* Title */}
            <div>
              <label className={labelCls}>Title <span className="text-red-400 normal-case">*</span></label>
              <input {...register('title')} className={inputCls} placeholder="Enter requirement title…" />
              {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Describe the requirement in detail…"
              />
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Status</label>
                <SingleSelect
                  value={status}
                  onChange={(v) => setValue('status', v as Status)}
                  options={STATUS_OPTIONS}
                />
              </div>
              <div>
                <label className={labelCls}>Priority</label>
                <SingleSelect
                  value={priority}
                  onChange={(v) => setValue('priority', v as Priority)}
                  options={PRIORITY_OPTIONS}
                />
              </div>
            </div>

            {/* Assignee + Due date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Assignee</label>
                <UserSelect
                  value={assigned_to_id}
                  onChange={(v) => setValue('assigned_to_id', v)}
                  users={users}
                />
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
                {tags?.map((tag) => {
                  const active = selectedTags.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium border transition-all duration-150"
                      style={{
                        borderColor:     active ? tag.color + '80' : '#e5e7eb',
                        backgroundColor: active ? tag.color + '14' : 'transparent',
                        color:           active ? tag.color : '#9ca3af',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                      {active && <Check size={11} style={{ color: tag.color }} />}
                    </button>
                  )
                })}
                {!tags?.length && (
                  <p className="text-[12px] text-gray-400">No tags yet — create them in Settings → Tags.</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-100 bg-gray-50/40 rounded-b-2xl shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={cn(
                'px-5 py-2 text-[13px] font-medium text-white rounded-lg transition-colors shadow-sm',
                'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50',
                'shadow-violet-600/25',
              )}
            >
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
