import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Pencil, MessageSquare, Clock, Trash2, Send, CheckSquare, Plus, FileText, Calendar, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { Requirement, Task, TaskStatus, Status, Priority } from '@/types'
import {
  useRequirementQuery, useCreateComment, useDeleteComment, useActivityQuery,
  useTasksQuery, useDeleteTask, useUpdateTask, useUpdateRequirement,
  useTagsQuery, useUsersQuery,
} from '@/hooks/useApi'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import UserAvatar from './UserAvatar'
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

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'todo',                  label: 'To Do' },
  { value: 'requirement_gathering', label: 'Requirement Gathering' },
  { value: 'development',           label: 'Development' },
  { value: 'sit',                   label: 'SIT' },
  { value: 'uat',                   label: 'UAT' },
  { value: 'd2p',                   label: 'D2P' },
  { value: 'production_test',       label: 'Production Test' },
  { value: 'completed',             label: 'Completed' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high',     label: 'High' },
  { value: 'medium',   label: 'Medium' },
  { value: 'low',      label: 'Low' },
]

const PRIORITY_COLOR: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#9ca3af',
}

const selectCls = 'text-[12px] font-medium border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 text-gray-700 transition-all'
const gridSelectCls = 'text-[13px] border border-gray-200 rounded-md px-2 py-1 bg-white w-full focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 text-gray-700 transition-all'

interface Props { requirement: Requirement; onClose: () => void }

export default function RequirementPanel({ requirement, onClose }: Props) {
  const { user } = useAuthStore()
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [comment, setComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const reqQuery      = useRequirementQuery(requirement.id)
  const activityQuery = useActivityQuery(requirement.id)
  const tasksQuery    = useTasksQuery(requirement.id)
  const tagsQuery     = useTagsQuery()
  const usersQuery    = useUsersQuery()

  const createComment = useCreateComment()
  const deleteComment = useDeleteComment()
  const deleteTask    = useDeleteTask()
  const updateTask    = useUpdateTask()
  const updateReq     = useUpdateRequirement()

  const { data: detail }       = useQuery({ ...reqQuery, placeholderData: requirement })
  const { data: activityData } = useQuery(activityQuery)
  const { data: tasksData }    = useQuery(tasksQuery)
  const { data: allTags }      = useQuery(tagsQuery)
  const { data: users }        = useQuery(usersQuery)

  const activity = activityData ?? []
  const tasks    = tasksData ?? []
  const req      = detail || requirement
  const canEdit  = user?.role === 'admin' || user?.role === 'editor'

  const [form, setForm] = useState({
    title:          requirement.title,
    description:    requirement.description || '',
    status:         requirement.status as Status,
    priority:       requirement.priority as Priority,
    assigned_to_id: requirement.assigned_to_id || '',
    due_date:       requirement.due_date ? requirement.due_date.split('T')[0] : '',
  })
  const [selectedTags, setSelectedTags] = useState<string[]>(
    requirement.tags?.map((t) => t.id) || []
  )

  useEffect(() => {
    const src = req
    setForm({
      title:          src.title,
      description:    src.description || '',
      status:         src.status as Status,
      priority:       src.priority as Priority,
      assigned_to_id: src.assigned_to_id || '',
      due_date:       src.due_date ? src.due_date.split('T')[0] : '',
    })
    setSelectedTags(src.tags?.map((t) => t.id) || [])
    setIsDirty(false)
  }, [requirement.id])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  const toggleTag = (id: string) => {
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id])
    setIsDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateReq(requirement.id, { ...form, tag_ids: selectedTags })
      setIsDirty(false)
      toast.success('Requirement saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    setForm({
      title:          req.title,
      description:    req.description || '',
      status:         req.status as Status,
      priority:       req.priority as Priority,
      assigned_to_id: req.assigned_to_id || '',
      due_date:       req.due_date ? req.due_date.split('T')[0] : '',
    })
    setSelectedTags(req.tags?.map((t) => t.id) || [])
    setIsDirty(false)
  }

  const handleDeleteTask = async (id: string) => {
    try { await deleteTask(id, requirement.id) }
    catch { toast.error('Failed to delete task') }
  }

  const handleCycleTaskStatus = async (task: Task) => {
    const cycle: Record<string, TaskStatus> = {
      todo: 'in_progress', in_progress: 'done', done: 'todo', blocked: 'todo',
    }
    try { await updateTask(task.id, requirement.id, { status: cycle[task.status] }) }
    catch { toast.error('Failed to update task') }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return
    setAddingComment(true)
    try {
      await createComment(requirement.id, comment.trim())
      toast.success('Comment added')
      setComment('')
    } catch { toast.error('Failed to add comment') }
    finally { setAddingComment(false) }
  }

  const handleDeleteComment = async (id: string) => {
    try { await deleteComment(id, requirement.id) }
    catch { toast.error('Failed to delete comment') }
  }

  const exportPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text(form.title, 14, 20)
      doc.setFontSize(10)
      doc.text(`Status: ${form.status}  |  Priority: ${form.priority}`, 14, 30)
      doc.text(`Created: ${formatDate(req.created_at)}  |  Due: ${formatDate(form.due_date)}`, 14, 36)
      if (form.description) {
        doc.setFontSize(11); doc.text('Description:', 14, 46)
        doc.setFontSize(10)
        const lines = doc.splitTextToSize(form.description, 180)
        doc.text(lines, 14, 52)
      }
      doc.save(`requirement-${requirement.id.slice(0, 8)}.pdf`)
      toast.success('PDF exported')
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-40 flex animate-fade-in">
        <div className="flex-1 bg-black/20" onClick={onClose} />
        <div className="w-[520px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right border-l border-gray-200">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 shrink-0 min-h-[52px]">
            <div className="flex items-center gap-2">
              {isDirty ? (
                <>
                  <span className="text-[11px] text-amber-600 font-medium">Unsaved changes</span>
                  <button
                    onClick={handleDiscard}
                    className="px-2.5 py-1.5 text-[12px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors disabled:opacity-50 shadow-sm shadow-violet-600/20"
                  >
                    <Save size={12} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={exportPDF}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-gray-600 hover:text-violet-700 hover:bg-violet-50 rounded-md transition-colors"
                >
                  <FileText size={13} /> PDF
                </button>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Priority stripe — updates live as priority changes */}
          <div className="h-1 shrink-0 transition-colors duration-200" style={{ backgroundColor: PRIORITY_COLOR[form.priority] }} />

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

            {/* Title */}
            {canEdit ? (
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className="text-[17px] font-semibold text-gray-900 leading-snug w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-violet-400 focus:bg-violet-50/10 rounded-lg px-2 py-1 -mx-2 focus:outline-none transition-colors"
                placeholder="Requirement title…"
              />
            ) : (
              <h2 className="text-[17px] font-semibold text-gray-900 leading-snug">{req.title}</h2>
            )}

            {/* Status + Priority */}
            {canEdit ? (
              <div className="flex items-center gap-2 flex-wrap">
                <select value={form.status} onChange={(e) => set('status', e.target.value as Status)} className={selectCls}>
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={form.priority} onChange={(e) => set('priority', e.target.value as Priority)} className={selectCls}>
                  {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={req.status} />
                <PriorityBadge priority={req.priority} />
              </div>
            )}

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50/60 rounded-xl p-4 border border-gray-100">
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">Assignee</p>
                {canEdit ? (
                  <select value={form.assigned_to_id} onChange={(e) => set('assigned_to_id', e.target.value)} className={gridSelectCls}>
                    <option value="">Unassigned</option>
                    {users?.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                  </select>
                ) : (
                  req.assigned_to
                    ? <UserAvatar user={req.assigned_to} showName />
                    : <span className="text-[13px] text-gray-400">Unassigned</span>
                )}
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">Created by</p>
                {req.created_by && <UserAvatar user={req.created_by} showName />}
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">Due date</p>
                {canEdit ? (
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => set('due_date', e.target.value)}
                    className={gridSelectCls}
                  />
                ) : (
                  <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                    <Calendar size={13} className="text-gray-400" />
                    {formatDate(req.due_date) || 'No due date'}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">Created</p>
                <span className="text-[13px] text-gray-700">{formatDate(req.created_at)}</span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Tags</p>
              {canEdit ? (
                <div className="flex flex-wrap gap-1.5">
                  {allTags?.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium border transition-all duration-150"
                      style={{
                        borderColor: selectedTags.includes(t.id) ? t.color : 'transparent',
                        backgroundColor: selectedTags.includes(t.id) ? t.color + '18' : '#f9fafb',
                        color: selectedTags.includes(t.id) ? t.color : '#6b7280',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.name}
                    </button>
                  ))}
                  {!allTags?.length && <span className="text-[12px] text-gray-400">No tags available</span>}
                </div>
              ) : req.tags && req.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {req.tags.map((t) => (
                    <span
                      key={t.id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium"
                      style={{ backgroundColor: t.color + '18', color: t.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[12px] text-gray-400">No tags</span>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Description</p>
              {canEdit ? (
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={4}
                  placeholder="Add a description…"
                  className="w-full text-[13px] text-gray-700 leading-relaxed border border-gray-200 hover:border-gray-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 rounded-lg p-3.5 resize-none focus:outline-none transition-all bg-gray-50"
                />
              ) : req.description ? (
                <p className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3.5 border border-gray-100">
                  {req.description}
                </p>
              ) : (
                <span className="text-[12px] text-gray-400">No description</span>
              )}
            </div>

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

              {tasks.length === 0 && <p className="text-xs text-gray-400">No tasks yet.</p>}

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
                <MessageSquare size={13} className="text-gray-400" />
                <span className="text-[12px] font-semibold text-gray-600 uppercase tracking-wide">
                  Comments ({req.comments?.length || 0})
                </span>
              </div>
              <div className="space-y-3">
                {req.comments?.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    <UserAvatar user={c.author} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-semibold text-gray-800">{c.author?.full_name}</span>
                        <span className="text-[11px] text-gray-400">{formatRelative(c.created_at)}</span>
                        {(c.author_id === user?.id || user?.role === 'admin') && (
                          <button onClick={() => handleDeleteComment(c.id)} className="ml-auto text-gray-300 hover:text-red-400 transition-colors">
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                      <p className="text-[13px] text-gray-700 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed border border-gray-100">
                        {c.body}
                      </p>
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
                    placeholder="Add a comment…"
                    className="flex-1 text-[13px] border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!comment.trim() || addingComment}
                    className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
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
                  <Clock size={13} className="text-gray-400" />
                  <span className="text-[12px] font-semibold text-gray-600 uppercase tracking-wide">Activity</span>
                </div>
                <div className="space-y-2.5">
                  {activity.map((a) => (
                    <div key={a.id} className="flex items-start gap-2.5">
                      <UserAvatar user={a.actor} size="sm" />
                      <div className="flex-1">
                        <p className="text-[12px] text-gray-600">
                          <span className="font-medium text-gray-700">{a.actor?.full_name}</span>{' '}
                          {actionLabel(a.action)}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatRelative(a.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
