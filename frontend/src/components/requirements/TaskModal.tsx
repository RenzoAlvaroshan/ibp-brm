import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import type { Task } from '@/types'
import { useCreateTask, useUpdateTask, useAppsQuery } from '@/hooks/useApi'
import { SingleSelect } from '@/components/ui/Select'
import { cn } from '@/utils'

const schema = z.object({
  title:       z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status:      z.enum(['todo', 'in_progress', 'done', 'blocked']).optional(),
  target_date: z.string().optional(),
  app_id:      z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  requirementId: string
  task?: Task
  onClose: () => void
}

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do',       dot: '#9ca3af' },
  { value: 'in_progress', label: 'In Progress',  dot: '#6366f1' },
  { value: 'done',        label: 'Done',         dot: '#10b981' },
  { value: 'blocked',     label: 'Blocked',      dot: '#ef4444' },
]

export default function TaskModal({ requirementId, task, onClose }: Props) {
  const isEdit    = !!task
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const [saving, setSaving] = useState(false)

  const appsQuery = useAppsQuery()
  const { data: apps = [] } = useQuery(appsQuery)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:       task?.title || '',
      description: task?.description || '',
      status:      task?.status || 'todo',
      target_date: task?.target_date ? task.target_date.split('T')[0] : '',
      app_id:      task?.app_id || '',
    },
  })

  const status = watch('status') || 'todo'
  const app_id = watch('app_id') || ''

  const appOptions = [
    { value: '', label: 'No app' },
    ...apps.map((a) => ({ value: a.id, label: a.name })),
  ]

  const onSubmit = async (data: FormValues) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        app_id:      data.app_id      || undefined,
        target_date: data.target_date || undefined,
      }
      if (isEdit) {
        await updateTask(task.id, requirementId, payload)
        toast.success('Task updated')
      } else {
        await createTask(requirementId, payload)
        toast.success('Task created')
      }
      onClose()
    } catch {
      toast.error('Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all placeholder:text-gray-400'
  const labelCls = 'text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px] animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 w-full max-w-[480px] max-h-[90vh] flex flex-col animate-scale-in border border-gray-200/60 mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">
              {isEdit ? 'Edit Task' : 'New Task'}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isEdit ? 'Update the fields below' : 'Fill in the details to create a new task'}
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
              <input {...register('title')} className={inputCls} placeholder="Enter task title…" />
              {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Describe the task…"
              />
            </div>

            {/* Status + Target Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Status</label>
                <SingleSelect
                  value={status}
                  onChange={(v) => setValue('status', v as FormValues['status'])}
                  options={STATUS_OPTIONS}
                />
              </div>
              <div>
                <label className={labelCls}>Target Date</label>
                <input {...register('target_date')} type="date" className={inputCls} />
              </div>
            </div>

            {/* Related App */}
            <div>
              <label className={labelCls}>Related App</label>
              <SingleSelect
                value={app_id}
                onChange={(v) => setValue('app_id', v)}
                options={appOptions}
                placeholder="No app"
              />
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
