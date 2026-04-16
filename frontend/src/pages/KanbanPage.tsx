import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext, DragEndEvent, DragOverEvent, DragOverlay,
  DragStartEvent, PointerSensor, useSensor, useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { Plus, MessageSquare, Calendar } from 'lucide-react'
import { requirementsApi } from '@/api/endpoints'
import type { Requirement, Status } from '@/types'
import { statusConfig, formatDate } from '@/utils'
import PriorityBadge from '@/components/requirements/PriorityBadge'
import UserAvatar from '@/components/requirements/UserAvatar'
import RequirementModal from '@/components/requirements/RequirementModal'
import RequirementPanel from '@/components/requirements/RequirementPanel'
import { useAuthStore } from '@/store/auth'

const COLUMNS: Status[] = ['draft', 'review', 'approved', 'rejected']

function KanbanCard({
  req,
  onClick,
  overlay = false,
}: {
  req: Requirement
  onClick: () => void
  overlay?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: req.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={overlay ? {} : style}
      {...attributes}
      {...listeners}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={`bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow select-none ${overlay ? 'shadow-xl rotate-2' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">{req.title}</p>
        <PriorityBadge priority={req.priority} dotOnly />
      </div>

      {req.tags && req.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {req.tags.slice(0, 3).map(t => (
            <span key={t.id} className="px-1.5 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: t.color + '20', color: t.color }}>
              {t.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <UserAvatar user={req.assigned_to} size="sm" />
          {req.due_date && (
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Calendar size={10} />
              {formatDate(req.due_date)}
            </div>
          )}
        </div>
        {(req.comments?.length || 0) > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <MessageSquare size={10} />
            {req.comments?.length}
          </div>
        )}
      </div>
    </div>
  )
}

function KanbanColumn({
  status,
  reqs,
  onCardClick,
  onAdd,
  canCreate,
}: {
  status: Status
  reqs: Requirement[]
  onCardClick: (r: Requirement) => void
  onAdd: (status: Status) => void
  canCreate: boolean
}) {
  const cfg = statusConfig[status]
  const colorMap: Record<Status, string> = {
    draft: 'border-gray-300 bg-gray-50',
    review: 'border-amber-300 bg-amber-50',
    approved: 'border-green-300 bg-green-50',
    rejected: 'border-red-300 bg-red-50',
  }
  const headerColorMap: Record<Status, string> = {
    draft: 'bg-gray-200 text-gray-700',
    review: 'bg-amber-200 text-amber-800',
    approved: 'bg-green-200 text-green-800',
    rejected: 'bg-red-200 text-red-800',
  }

  return (
    <div className={`flex flex-col rounded-xl border-2 ${colorMap[status]} min-w-[280px] flex-1 max-w-sm`}>
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-inherit">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${headerColorMap[status]}`}>
            {cfg.label}
          </span>
          <span className="text-xs text-gray-500 font-medium">{reqs.length}</span>
        </div>
        {canCreate && (
          <button
            onClick={() => onAdd(status)}
            className="p-1 rounded hover:bg-white/60 text-gray-500 hover:text-gray-700"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto kanban-column">
        <SortableContext items={reqs.map(r => r.id)} strategy={verticalListSortingStrategy}>
          {reqs.map(r => (
            <KanbanCard key={r.id} req={r} onClick={() => onCardClick(r)} />
          ))}
        </SortableContext>

        {reqs.length === 0 && (
          <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400">
            Drop here
          </div>
        )}
      </div>
    </div>
  )
}

export default function KanbanPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const canCreate = user?.role === 'admin' || user?.role === 'editor'

  const [activeReq, setActiveReq] = useState<Requirement | null>(null)
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null)
  const [addToStatus, setAddToStatus] = useState<Status | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const { data } = useQuery({
    queryKey: ['requirements', { limit: 200 }],
    queryFn: () => requirementsApi.list({ limit: 200, sort: 'position', dir: 'asc' }).then(r => r.data),
  })

  const reorder = useMutation({
    mutationFn: (items: { id: string; position: number; status: string }[]) =>
      requirementsApi.reorder(items),
    onError: () => toast.error('Failed to save order'),
  })

  const allReqs = data?.data || []

  // Group by status
  const columns: Record<Status, Requirement[]> = {
    draft:    allReqs.filter(r => r.status === 'draft').sort((a, b) => a.position - b.position),
    review:   allReqs.filter(r => r.status === 'review').sort((a, b) => a.position - b.position),
    approved: allReqs.filter(r => r.status === 'approved').sort((a, b) => a.position - b.position),
    rejected: allReqs.filter(r => r.status === 'rejected').sort((a, b) => a.position - b.position),
  }

  const findColumn = useCallback((id: string): Status | null => {
    for (const status of COLUMNS) {
      if (columns[status].some(r => r.id === id)) return status
    }
    return null
  }, [columns])

  const handleDragStart = (e: DragStartEvent) => {
    const req = allReqs.find(r => r.id === e.active.id)
    setActiveReq(req || null)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveReq(null)
    const { active, over } = e
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeCol = findColumn(activeId)
    const overCol = COLUMNS.includes(overId as Status) ? overId as Status : findColumn(overId)

    if (!activeCol || !overCol) return
    if (activeId === overId) return

    // Optimistic update: build new items array
    const newItems: { id: string; position: number; status: string }[] = []

    if (activeCol === overCol) {
      const col = [...columns[activeCol]]
      const fromIdx = col.findIndex(r => r.id === activeId)
      const toIdx = col.findIndex(r => r.id === overId)
      if (fromIdx === -1 || toIdx === -1) return

      col.splice(fromIdx, 1)
      col.splice(toIdx, 0, allReqs.find(r => r.id === activeId)!)
      col.forEach((r, i) => newItems.push({ id: r.id, position: i, status: activeCol }))
    } else {
      // Moving to different column
      const sourceCol = columns[activeCol].filter(r => r.id !== activeId)
      sourceCol.forEach((r, i) => newItems.push({ id: r.id, position: i, status: activeCol }))

      const targetCol = [...columns[overCol]]
      const toIdx = targetCol.findIndex(r => r.id === overId)
      const movedReq = allReqs.find(r => r.id === activeId)!
      if (toIdx === -1) targetCol.push(movedReq)
      else targetCol.splice(toIdx, 0, movedReq)
      targetCol.forEach((r, i) => newItems.push({ id: r.id, position: i, status: overCol }))

      newItems.push({ id: activeId, position: toIdx === -1 ? targetCol.length - 1 : toIdx, status: overCol })
    }

    // Optimistic update query cache
    queryClient.setQueryData(['requirements', { limit: 200 }], (old: any) => {
      if (!old) return old
      const idStatusMap = Object.fromEntries(newItems.map(i => [i.id, i]))
      return {
        ...old,
        data: old.data.map((r: Requirement) =>
          idStatusMap[r.id]
            ? { ...r, status: idStatusMap[r.id].status as Status, position: idStatusMap[r.id].position }
            : r
        ),
      }
    })

    reorder.mutate(newItems)
  }

  return (
    <div className="h-full">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
          {COLUMNS.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              reqs={columns[status]}
              onCardClick={setSelectedReq}
              onAdd={setAddToStatus}
              canCreate={canCreate}
            />
          ))}
        </div>

        <DragOverlay>
          {activeReq && <KanbanCard req={activeReq} onClick={() => {}} overlay />}
        </DragOverlay>
      </DndContext>

      {addToStatus && (
        <RequirementModal
          defaultStatus={addToStatus}
          onClose={() => setAddToStatus(null)}
        />
      )}
      {selectedReq && (
        <RequirementPanel
          requirement={selectedReq}
          onClose={() => setSelectedReq(null)}
        />
      )}
    </div>
  )
}
