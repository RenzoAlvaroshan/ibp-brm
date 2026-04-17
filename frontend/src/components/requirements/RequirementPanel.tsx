import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Pencil, MessageSquare, Clock, Trash2, Send, CheckSquare, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Requirement, Task, TaskStatus } from '@/types'
import { useRequirementQuery, useCreateComment, useDeleteComment, useActivityQuery, useTasksQuery, useDeleteTask, useUpdateTask } from '@/hooks/useApi'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import UserAvatar from './UserAvatar'
import RequirementModal from './RequirementModal'
import TaskModal from './TaskModal'
import { formatDate, formatRelative, actionLabel } from '@/utils'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/utils'

const taskStatusConfig: Record<TaskStatus, { label: string; color: string }> = {
  todo:        { label: 'To Do',       color: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  done:        { label: 'Done',        color: 'bg-green-100 text-green-700' },
  blocked:     { label: 'Blocked',     color: 'bg-red-100 text-red-700' },
}

interface Props {
  requirement: Requirement
  onClose: () => void
}

export default function RequirementPanel({ requirement, onClose }: Props) {
  const { user } = useAuthStore()
  const [showEdit, setShowEdit] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [comment, setComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)

  const reqQuery = useRequirementQuery(requirement.id)
  const activityQuery = useActivityQuery(requirement.id)
  const tasksQuery = useTasksQuery(requirement.id)
  const createComment = useCreateComment()
  const deleteComment = useDeleteComment()
  const deleteTask = useDeleteTask()
  const updateTask = useUpdateTask()

  const { data: detail } = useQuery({ ...reqQuery, placeholderData: requirement })
  const { data: activity = [] } = useQuery(activityQuery)
  const { data: tasks = [] } = useQuery(tasksQuery)

  const req = detail || requirement
  const canEdit = user?.role === 'admin' || user?.role === 'editor'

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id, requirement.id)
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleCycleTaskStatus = async (task: Task) => {
    const cycle: Record<string, TaskStatus> = {
      todo: 'in_progress', in_progress: 'done', done: 'todo', blocked: 'todo',
    }
    try {
      await updateTask(task.id, requirement.id, { status: cycle[task.status] })
    } catch {
      toast.error('Failed to update task')
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return
    setAddingComment(true)
    try {
      await createComment(requirement.id, comment.trim())
      toast.success('Comment added')
      setComment('')
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setAddingComment(false)
    }
  }

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteComment(id, requirement.id)
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  const exportPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text(req.title, 14, 20)
      doc.setFontSize(10)
      doc.text(`Status: ${req.status}  |  Priority: ${req.priority}`, 14, 30)
      doc.text(`Created: ${formatDate(req.created_at)}  |  Due: ${formatDate(req.due_date)}`, 14, 36)
      if (req.description) {
        doc.setFontSize(11)
        doc.text('Description:', 14, 46)
        doc.setFontSize(10)
        const lines = doc.splitTextToSize(req.description, 180)
        doc.text(lines, 14, 52)
      }
      doc.save(`requirement-${req.id.slice(0, 8)}.pdf`)
      toast.success('PDF exported')
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-40 flex">
        <div className="flex-1 bg-black/30" onClick={onClose} />
        <div className="w-[480px] bg-white h-full shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              {canEdit && (
                <button onClick={() => setShowEdit(true)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                  <Pencil size={15} />
                </button>
              )}
              <button onClick={exportPDF} className="text-xs text-indigo-600 hover:underline">Export PDF</button>
            </div>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 leading-snug">{req.title}</h2>

            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={req.status} />
              <PriorityBadge priority={req.priority} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Assignee</p>
                {req.assigned_to ? <UserAvatar user={req.assigned_to} showName /> : <span className="text-gray-400 text-xs">Unassigned</span>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Created by</p>
                {req.created_by && <UserAvatar user={req.created_by} showName />}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Due date</p>
                <span className="text-gray-700">{formatDate(req.due_date)}</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Created</p>
                <span className="text-gray-700">{formatDate(req.created_at)}</span>
              </div>
            </div>

            {req.tags && req.tags.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {req.tags.map((t) => (
                    <span key={t.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: t.color + '20', color: t.color }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {req.description && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{req.description}</p>
              </div>
            )}

            {/* Tasks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Tasks ({tasks.length})
                  </span>
                </div>
                {canEdit && (
                  <button
                    onClick={() => { setEditingTask(undefined); setShowTaskModal(true) }}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <Plus size={13} /> Add task
                  </button>
                )}
              </div>

              {tasks.length === 0 && (
                <p className="text-xs text-gray-400">No tasks yet.</p>
              )}

              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <button
                            onClick={() => canEdit && handleCycleTaskStatus(task)}
                            className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', taskStatusConfig[task.status].color, canEdit && 'cursor-pointer hover:opacity-80')}
                          >
                            {taskStatusConfig[task.status].label}
                          </button>
                          {task.app && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                              {task.app.name}
                            </span>
                          )}
                          {task.target_date && (
                            <span className="text-[10px] text-gray-400">{formatDate(task.target_date)}</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{task.description}</p>
                        )}
                      </div>
                      {canEdit && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => { setEditingTask(task); setShowTaskModal(true) }}
                            className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <MessageSquare size={14} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Comments ({req.comments?.length || 0})
                </span>
              </div>
              <div className="space-y-3">
                {req.comments?.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    <UserAvatar user={c.author} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-800">{c.author?.full_name}</span>
                        <span className="text-[10px] text-gray-400">{formatRelative(c.created_at)}</span>
                        {(c.author_id === user?.id || user?.role === 'admin') && (
                          <button onClick={() => handleDeleteComment(c.id)} className="ml-auto text-gray-300 hover:text-red-400">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              {canEdit && (
                <div className="flex gap-2 mt-3">
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                    placeholder="Add a comment... (Enter to submit)"
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!comment.trim() || addingComment}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Send size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Activity */}
            {activity.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Activity</span>
                </div>
                <div className="space-y-2">
                  {activity.map((a) => (
                    <div key={a.id} className="flex items-start gap-2 text-xs text-gray-500">
                      <UserAvatar user={a.actor} size="sm" />
                      <div>
                        <span className="font-medium text-gray-700">{a.actor?.full_name}</span>{' '}
                        {actionLabel(a.action)}
                        <span className="text-gray-400 ml-2">{formatRelative(a.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEdit && <RequirementModal requirement={req} onClose={() => setShowEdit(false)} />}
      {showTaskModal && (
        <TaskModal
          requirementId={requirement.id}
          task={editingTask}
          onClose={() => { setShowTaskModal(false); setEditingTask(undefined) }}
        />
      )}
    </>
  )
}
