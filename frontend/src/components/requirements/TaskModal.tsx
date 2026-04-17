import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import type { Task } from '@/types'
import { useCreateTask, useUpdateTask, useAppsQuery } from '@/hooks/useApi'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'blocked']).optional(),
  target_date: z.string().optional(),
  app_id: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  requirementId: string
  task?: Task
  onClose: () => void
}

export default function TaskModal({ requirementId, task, onClose }: Props) {
  const isEdit = !!task
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const appsQuery = useAppsQuery()
  const { data: apps = [] } = useQuery(appsQuery)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'todo',
      target_date: task?.target_date ? task.target_date.split('T')[0] : '',
      app_id: task?.app_id || '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        app_id: data.app_id || undefined,
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
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Title *</label>
            <input
              {...register('title')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Task title..."
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
              <select {...register('status')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Target Date</label>
              <input
                {...register('target_date')}
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Related App</label>
            <select {...register('app_id')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">No app</option>
              {apps.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md">
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
