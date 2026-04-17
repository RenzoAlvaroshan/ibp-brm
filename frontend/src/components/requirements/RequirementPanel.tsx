import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Pencil, MessageSquare, Clock, Trash2, Send, FileText, Calendar, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { Requirement } from '@/types'
import { useRequirementQuery, useCreateComment, useDeleteComment } from '@/hooks/useApi'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import UserAvatar from './UserAvatar'
import RequirementModal from './RequirementModal'
import { formatDate, formatRelative, actionLabel } from '@/utils'
import { useAuthStore } from '@/store/auth'
import { mockActivity } from '@/api/mockData'
import { useDemoStore } from '@/store/demo'

interface Props { requirement: Requirement; onClose: () => void }

export default function RequirementPanel({ requirement, onClose }: Props) {
  const { user } = useAuthStore()
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const [showEdit, setShowEdit] = useState(false)
  const [comment, setComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)

  const reqQuery     = useRequirementQuery(requirement.id)
  const createComment = useCreateComment()
  const deleteComment = useDeleteComment()

  const { data: detail } = useQuery({ ...reqQuery, initialData: requirement })
  const req     = detail || requirement
  const canEdit = user?.role === 'admin' || user?.role === 'editor'

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
      doc.text(req.title, 14, 20)
      doc.setFontSize(10)
      doc.text(`Status: ${req.status}  |  Priority: ${req.priority}`, 14, 30)
      doc.text(`Created: ${formatDate(req.created_at)}  |  Due: ${formatDate(req.due_date)}`, 14, 36)
      if (req.description) {
        doc.setFontSize(11); doc.text('Description:', 14, 46)
        doc.setFontSize(10)
        const lines = doc.splitTextToSize(req.description, 180)
        doc.text(lines, 14, 52)
      }
      doc.save(`requirement-${req.id.slice(0, 8)}.pdf`)
      toast.success('PDF exported')
    })
  }

  const activity = isDemoMode
    ? mockActivity.filter((a) => a.requirement_id === requirement.id)
    : []

  const PRIORITY_COLOR: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#9ca3af' }

  return (
    <>
      <div className="fixed inset-0 z-40 flex animate-fade-in">
        <div className="flex-1 bg-black/20" onClick={onClose} />
        <div className="w-[500px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right border-l border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-gray-600 hover:text-violet-700 hover:bg-violet-50 rounded-md transition-colors"
                >
                  <Pencil size={13} /> Edit
                </button>
              )}
              <button
                onClick={exportPDF}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-gray-600 hover:text-violet-700 hover:bg-violet-50 rounded-md transition-colors"
              >
                <FileText size={13} /> PDF
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Priority stripe */}
          <div className="h-1 shrink-0" style={{ backgroundColor: PRIORITY_COLOR[req.priority] }} />

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* Title */}
            <h2 className="text-[17px] font-semibold text-gray-900 leading-snug">{req.title}</h2>

            {/* Status + Priority */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={req.status} />
              <PriorityBadge priority={req.priority} />
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50/60 rounded-xl p-4 border border-gray-100">
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">Assignee</p>
                {req.assigned_to ? <UserAvatar user={req.assigned_to} showName /> : <span className="text-[13px] text-gray-400">Unassigned</span>}
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">Created by</p>
                {req.created_by && <UserAvatar user={req.created_by} showName />}
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">Due date</p>
                <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                  <Calendar size={13} className="text-gray-400" />
                  {formatDate(req.due_date) || 'No due date'}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">Created</p>
                <span className="text-[13px] text-gray-700">{formatDate(req.created_at)}</span>
              </div>
            </div>

            {/* Tags */}
            {req.tags && req.tags.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Tags</p>
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
              </div>
            )}

            {/* Description */}
            {req.description && (
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Description</p>
                <p className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3.5 border border-gray-100">
                  {req.description}
                </p>
              </div>
            )}

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
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="ml-auto text-gray-300 hover:text-red-400 transition-colors"
                          >
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
                    placeholder="Add a comment..."
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

      {showEdit && <RequirementModal requirement={req} onClose={() => setShowEdit(false)} />}
    </>
  )
}
