import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  X, Pencil, MessageSquare, Clock, Trash2, Send, CheckSquare,
  Plus, FileText, Calendar, Save, Copy,
} from 'lucide-react'
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
import { SingleSelect, UserSelect } from '@/components/ui/Select'
import MarkdownEditor, { MarkdownContent } from '@/components/ui/MarkdownEditor'
import TaskModal from './TaskModal'
import { formatDate, formatRelative, actionLabel } from '@/utils'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/utils'

const taskStatusConfig: Record<TaskStatus, { label: string; color: string }> = {
  todo:        { label: 'To Do',       color: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'In Progress', color: 'bg-violet-100 text-violet-700' },
  done:        { label: 'Done',        color: 'bg-emerald-100 text-emerald-700' },
  blocked:     { label: 'Blocked',     color: 'bg-red-100 text-red-600' },
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

const labelCls = 'text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block'
const gridSelectCls = 'px-2 py-1 text-[13px] w-full'

interface Props { requirement: Requirement; onClose: () => void }

export default function RequirementPanel({ requirement, onClose }: Props) {
  const { user } = useAuthStore()
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [comment, setComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [descEditing, setDescEditing] = useState(false)

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
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
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
      doc.setFontSize(16); doc.text(form.title, 14, 20)
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] animate-fade-in p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-7xl h-[90vh] bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-200/60 flex flex-col overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Top bar ───────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
            {/* Left: Export PDF + ID */}
            <div className="flex items-center gap-2">
              <button
                onClick={exportPDF}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-gray-600 hover:text-violet-700 hover:bg-violet-50 rounded-md transition-colors"
              >
                <FileText size={13} /> Export PDF
              </button>
              <div className="flex items-center gap-1 pl-3 border-l border-gray-200">
                <span className="text-[11px] font-mono text-gray-400 select-all">{req.id}</span>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(req.id); toast.success('ID copied') }}
                  className="p-1 rounded text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                  title="Copy ID"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>

            {/* Right: unsaved indicator + Save + Close */}
            <div className="flex items-center gap-2">
              {isDirty && (
                <span className="text-[11px] text-amber-600 font-medium">Unsaved changes</span>
              )}
              {isDirty && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors disabled:opacity-50 shadow-sm shadow-violet-600/20"
                >
                  <Save size={12} /> {saving ? 'Saving…' : 'Save'}
                </button>
              )}
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Priority stripe */}
          <div className="h-[3px] shrink-0 transition-colors duration-200" style={{ backgroundColor: PRIORITY_COLOR[form.priority] }} />

          {/* ── Two-column body ───────────────────────────────── */}
          <div className="flex flex-1 min-h-0">

            {/* ── LEFT: Details + Tasks ── */}
            <div className="flex-[4] overflow-y-auto px-7 py-6 space-y-6 border-r border-gray-100">

              {/* Title */}
              {canEdit ? (
                <input
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  className="text-[20px] font-bold text-gray-900 leading-snug w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-violet-400 focus:bg-violet-50/10 rounded-lg px-2 py-1 -mx-2 focus:outline-none transition-colors"
                  placeholder="Requirement title…"
                />
              ) : (
                <h2 className="text-[20px] font-bold text-gray-900 leading-snug">{req.title}</h2>
              )}

              {/* Status + Priority */}
              {canEdit ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <SingleSelect
                    value={form.status}
                    onChange={(v) => set('status', v as Status)}
                    options={STATUS_OPTIONS}
                    className="px-2.5 py-1.5 text-[13px]"
                  />
                  <SingleSelect
                    value={form.priority}
                    onChange={(v) => set('priority', v as Priority)}
                    options={PRIORITY_OPTIONS}
                    className="px-2.5 py-1.5 text-[13px]"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={req.status} />
                  <PriorityBadge priority={req.priority} />
                </div>
              )}

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-5 bg-gray-50/60 rounded-xl p-4 border border-gray-100">
                <div>
                  <p className={labelCls}>Assignee</p>
                  {canEdit ? (
                    <UserSelect value={form.assigned_to_id} onChange={(v) => set('assigned_to_id', v)} users={users} className={gridSelectCls} />
                  ) : req.assigned_to ? (
                    <UserAvatar user={req.assigned_to} showName />
                  ) : (
                    <span className="text-[13px] text-gray-400">Unassigned</span>
                  )}
                </div>
                <div>
                  <p className={labelCls}>Created by</p>
                  {req.created_by && <UserAvatar user={req.created_by} showName />}
                </div>
                <div>
                  <p className={labelCls}>Due date</p>
                  {canEdit ? (
                    <input type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} className={gridSelectCls} />
                  ) : (
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                      <Calendar size={13} className="text-gray-400" />
                      {formatDate(req.due_date) || 'No due date'}
                    </div>
                  )}
                </div>
                <div>
                  <p className={labelCls}>Created</p>
                  <span className="text-[13px] text-gray-700">{formatDate(req.created_at)}</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className={labelCls}>Tags</p>
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
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Description</p>
                  {req.description && !canEdit && (
                    <button
                      onClick={() => setDescExpanded((v) => !v)}
                      className="text-[11px] text-violet-600 hover:text-violet-800 font-medium transition-colors"
                    >
                      {descExpanded ? 'Collapse' : 'Expand'}
                    </button>
                  )}
                </div>
                {canEdit ? (
                  descEditing ? (
                    <MarkdownEditor
                      key={requirement.id}
                      value={form.description}
                      onChange={(v) => set('description', v)}
                      onBlur={() => setDescEditing(false)}
                      placeholder="Write description in Markdown…"
                      autoFocus
                    />
                  ) : (
                    <div
                      onClick={() => setDescEditing(true)}
                      className={cn(
                        'cursor-text rounded-lg border border-gray-200 hover:border-violet-300 px-4 py-3 min-h-[80px] transition-colors',
                        !form.description && 'flex items-center',
                      )}
                    >
                      {form.description
                        ? <MarkdownContent>{form.description}</MarkdownContent>
                        : <span className="text-[13px] text-gray-400">Click to add a description (Markdown supported)</span>
                      }
                    </div>
                  )
                ) : req.description ? (
                  <div
                    className={cn(
                      'bg-gray-50 rounded-lg p-3.5 border border-gray-100 overflow-y-auto transition-all duration-300',
                      descExpanded ? 'max-h-[600px]' : 'max-h-[120px]',
                    )}
                  >
                    <MarkdownContent>{req.description}</MarkdownContent>
                  </div>
                ) : (
                  <span className="text-[12px] text-gray-400">No description</span>
                )}
              </div>

            </div>

            {/* ── RIGHT: Tasks + Comments + Activity ── */}
            <div className="flex-[2] flex flex-col min-h-0 bg-gray-50/30">

              {/* Tasks — scrollable top section */}
              <div className="overflow-y-auto px-5 py-5 border-b border-gray-200/60 max-h-[45%]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <CheckSquare size={14} className="text-gray-400" />
                    <span className="text-[12px] font-semibold text-gray-600 uppercase tracking-wide">
                      Tasks ({tasks.length})
                    </span>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => { setEditingTask(undefined); setShowTaskModal(true) }}
                      className="flex items-center gap-1 text-[12px] text-violet-600 hover:text-violet-800 font-medium"
                    >
                      <Plus size={13} /> Add task
                    </button>
                  )}
                </div>

                {tasks.length === 0 && (
                  <p className="text-[12px] text-gray-400 py-2">No tasks yet.</p>
                )}

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 bg-white transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <button
                              onClick={() => canEdit && handleCycleTaskStatus(task)}
                              className={cn(
                                'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                taskStatusConfig[task.status].color,
                                canEdit && 'cursor-pointer hover:opacity-80',
                              )}
                            >
                              {taskStatusConfig[task.status].label}
                            </button>
                            {task.app && (
                              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium border border-blue-100">
                                {task.app.name}
                              </span>
                            )}
                            {task.target_date && (
                              <span className="text-[10px] text-gray-400">{formatDate(task.target_date)}</span>
                            )}
                          </div>
                          <p className="text-[13px] font-medium text-gray-800">{task.title}</p>
                          {task.description && (
                            <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{task.description}</p>
                          )}
                        </div>
                        {canEdit && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => { setEditingTask(task); setShowTaskModal(true) }}
                              className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-md transition-colors"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
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

              {/* Scrollable comments + activity */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

                {/* Comments */}
                <div>
                  <div className="flex items-center gap-1.5 mb-4">
                    <MessageSquare size={13} className="text-gray-400" />
                    <span className="text-[12px] font-semibold text-gray-600 uppercase tracking-wide">
                      Comments ({req.comments?.length || 0})
                    </span>
                  </div>

                  {!req.comments?.length ? (
                    <div className="text-center py-8">
                      <MessageSquare size={24} className="mx-auto mb-2 text-gray-200" />
                      <p className="text-[12px] text-gray-400">No comments yet. Be the first!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {req.comments.map((c) => (
                        <div key={c.id} className="flex gap-2.5">
                          <UserAvatar user={c.author} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[12px] font-semibold text-gray-800">{c.author?.full_name}</span>
                              <span className="text-[11px] text-gray-400">{formatRelative(c.created_at)}</span>
                              {(c.author_id === user?.id || user?.role === 'admin') && (
                                <button
                                  onClick={() => handleDeleteComment(c.id)}
                                  className="ml-auto text-gray-300 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                            <p className="text-[13px] text-gray-700 bg-white rounded-lg px-3 py-2 leading-relaxed border border-gray-200/80 shadow-sm">
                              {c.body}
                            </p>
                          </div>
                        </div>
                      ))}
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
                    <div className="space-y-3">
                      {activity.map((a) => (
                        <div key={a.id} className="flex items-start gap-2.5">
                          <UserAvatar user={a.actor} size="sm" />
                          <div className="flex-1">
                            <p className="text-[12px] text-gray-600">
                              <span className="font-semibold text-gray-700">{a.actor?.full_name}</span>{' '}
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

              {/* Comment input — pinned to bottom */}
              {canEdit && (
                <div className="shrink-0 px-5 py-4 border-t border-gray-200/60 bg-white">
                  <div className="flex gap-2 items-end">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() }
                      }}
                      placeholder="Write a comment… (Enter to send)"
                      rows={2}
                      className="flex-1 text-[13px] border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none bg-gray-50 placeholder:text-gray-400"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!comment.trim() || addingComment}
                      className="shrink-0 p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-40 transition-colors shadow-sm shadow-violet-600/20"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
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
