import { useState, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DndContext, DragEndEvent, DragOverEvent, DragOverlay,
  DragStartEvent, PointerSensor, useSensor, useSensors,
  closestCorners, useDroppable, useDndContext,
  defaultDropAnimationSideEffects, type DropAnimation,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { Plus, MessageSquare, Calendar, X } from 'lucide-react'
import { useRequirementsQuery, useReorderRequirements } from '@/hooks/useApi'
import type { Requirement, Status } from '@/types'
import { formatDate } from '@/utils'
import UserAvatar from '@/components/requirements/UserAvatar'
import RequirementModal from '@/components/requirements/RequirementModal'
import RequirementPanel from '@/components/requirements/RequirementPanel'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/utils'

const COLUMNS: Status[] = ['todo', 'requirement_gathering', 'development', 'sit', 'uat', 'd2p', 'production_test', 'completed']

const COLUMN_CONFIG: Record<Status, { label: string; color: string; bg: string; dotColor: string; ringColor: string }> = {
  todo:                 { label: 'To Do',          color: 'text-gray-600',   bg: 'bg-gray-50/80',    dotColor: '#9ca3af', ringColor: '#9ca3af' },
  requirement_gathering:{ label: 'Req. Gathering', color: 'text-blue-700',   bg: 'bg-blue-50/40',    dotColor: '#3b82f6', ringColor: '#3b82f6' },
  development:          { label: 'Development',    color: 'text-indigo-700', bg: 'bg-indigo-50/40',  dotColor: '#6366f1', ringColor: '#6366f1' },
  sit:                  { label: 'SIT',            color: 'text-amber-700',  bg: 'bg-amber-50/40',   dotColor: '#f59e0b', ringColor: '#f59e0b' },
  uat:                  { label: 'UAT',            color: 'text-violet-700', bg: 'bg-violet-50/40',  dotColor: '#8b5cf6', ringColor: '#8b5cf6' },
  d2p:                  { label: 'D2P',            color: 'text-pink-700',   bg: 'bg-pink-50/40',    dotColor: '#ec4899', ringColor: '#ec4899' },
  production_test:      { label: 'Prod. Test',     color: 'text-orange-700', bg: 'bg-orange-50/40',  dotColor: '#f97316', ringColor: '#f97316' },
  completed:            { label: 'Completed',      color: 'text-emerald-700',bg: 'bg-emerald-50/40', dotColor: '#10b981', ringColor: '#10b981' },
}

const PRIORITY_COLOR: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#9ca3af',
}

const dropAnimation: DropAnimation = {
  duration: 320,
  easing: 'cubic-bezier(0.18, 0.89, 0.32, 1.15)',
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.35' } },
  }),
}

function KanbanCard({ req, onClick, overlay = false }: { req: Requirement; onClick: () => void; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: req.id,
    transition: { duration: 320, easing: 'cubic-bezier(0.34, 1.2, 0.64, 1)' },
  })

  const priorityColor = PRIORITY_COLOR[req.priority] || '#9ca3af'

  const cardContent = (
    <>
      <p className="text-[13px] font-medium text-gray-800 leading-snug line-clamp-2 mb-2.5">{req.title}</p>
      {req.tags && req.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {req.tags.slice(0, 3).map((t) => (
            <span
              key={t.id}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ backgroundColor: t.color + '18', color: t.color }}
            >
              {t.name}
            </span>
          ))}
          {req.tags.length > 3 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-400">+{req.tags.length - 3}</span>
          )}
        </div>
      )}
      <div className="flex items-center justify-between">
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
    </>
  )

  if (overlay) {
    return (
      <div
        style={{
          borderLeft: `3px solid ${priorityColor}`,
          transform: 'rotate(2.5deg) scale(1.04)',
          boxShadow: `0 25px 50px -12px ${priorityColor}40, 0 12px 24px rgba(0,0,0,0.12), 0 0 0 1px ${priorityColor}30`,
        }}
        className="bg-white rounded-lg p-3 cursor-grabbing select-none w-[260px] animate-card-lift"
      >
        {cardContent}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        borderLeft: `3px solid ${isDragging ? priorityColor + '60' : priorityColor}`,
        backgroundColor: isDragging ? '#f9fafb' : undefined,
      }}
      {...attributes}
      {...listeners}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={cn(
        'rounded-lg border p-3 select-none group',
        'transition-[border-color,box-shadow,transform] duration-150',
        isDragging
          ? 'border-dashed border-gray-300 pointer-events-none'
          : 'bg-white border-gray-200 cursor-grab active:cursor-grabbing kanban-card-hover',
      )}
    >
      <div className={cn(isDragging && 'opacity-30')}>
        {cardContent}
      </div>
    </div>
  )
}

function KanbanColumn({
  status, reqs, onCardClick, onAdd, canCreate, isDraggingGlobal,
}: {
  status: Status
  reqs: Requirement[]
  onCardClick: (r: Requirement) => void
  onAdd: (s: Status) => void
  canCreate: boolean
  isDraggingGlobal: boolean
}) {
  const cfg = COLUMN_CONFIG[status]
  const { setNodeRef: setDropRef, isOver: isOverColumn } = useDroppable({ id: status })
  const { over } = useDndContext()
  const overId = over?.id as string | undefined
  const isOver = isOverColumn || (!!overId && reqs.some((r) => r.id === overId))

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl min-w-[260px] flex-1 max-w-[300px]',
        'transition-all duration-200',
        cfg.bg,
      )}
      style={{
        border: isOver
          ? `2px solid ${cfg.ringColor}55`
          : '1px solid rgba(229, 231, 235, 0.8)',
        boxShadow: isOver
          ? `0 0 0 3px ${cfg.ringColor}15, 0 8px 28px ${cfg.ringColor}18`
          : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200/60">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
            style={{
              backgroundColor: cfg.dotColor,
              transform: isOver ? 'scale(1.25)' : 'scale(1)',
            }}
          />
          <span className={cn('text-[12px] font-semibold uppercase tracking-wide', cfg.color)}>
            {cfg.label}
          </span>
          <span className="text-[11px] font-semibold text-gray-400 bg-white/80 border border-gray-200 px-1.5 py-0.5 rounded-full transition-all duration-200">
            {reqs.length}
          </span>
        </div>
        {canCreate && (
          <button
            onClick={() => onAdd(status)}
            className="p-1 rounded hover:bg-white/70 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Cards */}
      <div
        ref={setDropRef}
        className={cn(
          'flex-1 p-2.5 space-y-2 overflow-y-auto kanban-column',
          'transition-colors duration-150',
        )}
      >
        <SortableContext items={reqs.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          {reqs.map((r) => (
            <KanbanCard key={r.id} req={r} onClick={() => onCardClick(r)} />
          ))}
        </SortableContext>

        {/* Drop indicator at bottom of non-empty column */}
        {isOver && reqs.length > 0 && (
          <div
            className="h-0.5 rounded-full mx-1 transition-all duration-200"
            style={{ backgroundColor: cfg.ringColor + '70' }}
          />
        )}

        {/* Empty drop zone */}
        {reqs.length === 0 && (
          <div
            className={cn(
              'flex flex-col items-center justify-center h-20 rounded-lg text-[12px]',
              'border-2 border-dashed transition-all duration-200',
              isDraggingGlobal && 'drop-zone-pulse',
            )}
            style={
              isOver
                ? { borderColor: cfg.ringColor + 'aa', backgroundColor: cfg.ringColor + '0c', color: cfg.ringColor }
                : undefined
            }
          >
            {!isOver && <span className="text-gray-300">Drop here</span>}
            {isOver && (
              <>
                <span className="text-lg mb-0.5" style={{ color: cfg.ringColor }}>↓</span>
                <span style={{ color: cfg.ringColor + 'cc' }}>Release to drop</span>
              </>
            )}
          </div>
        )}
      </div>

      {canCreate && (
        <button
          onClick={() => onAdd(status)}
          className="flex items-center gap-1.5 px-3 py-2.5 text-[12px] text-gray-400 hover:text-violet-600 hover:bg-white/60 transition-colors border-t border-gray-200/60 rounded-b-xl"
        >
          <Plus size={13} /> Add requirement
        </button>
      )}
    </div>
  )
}

const CANCEL_DROP_ID = '__cancel__'

function CancelDropZone({ visible }: { visible: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: CANCEL_DROP_ID })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full border-2 select-none pointer-events-auto',
        'transition-all duration-200',
        visible ? 'bottom-6 opacity-100' : 'bottom-0 opacity-0 pointer-events-none',
        isOver
          ? 'bg-red-500 border-red-500 text-white scale-110 shadow-[0_12px_32px_rgba(239,68,68,0.45)]'
          : 'bg-white border-gray-300 text-gray-600 shadow-lg',
      )}
    >
      <X size={16} />
      <span className="text-[12px] font-semibold uppercase tracking-wide">
        {isOver ? 'Release to cancel' : 'Drop here to cancel'}
      </span>
    </div>
  )
}

export default function KanbanPage() {
  const { user } = useAuthStore()
  const canCreate = user?.role === 'admin' || user?.role === 'editor'

  const [activeReq, setActiveReq] = useState<Requirement | null>(null)
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null)
  const [addToStatus, setAddToStatus] = useState<Status | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const lastCrossMoveRef = useRef<{ col: Status | null; t: number }>({ col: null, t: 0 })
  const originSnapshotRef = useRef<Requirement[] | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const reqsQuery = useRequirementsQuery({ limit: 200, sort: 'position', dir: 'asc' })
  const { data } = useQuery(reqsQuery)
  const reorderFn = useReorderRequirements()
  const queryClient = useQueryClient()

  const allReqs = data?.data || []

  const columns = Object.fromEntries(
    COLUMNS.map((s) => [s, allReqs.filter((r) => r.status === s).sort((a, b) => a.position - b.position)])
  ) as Record<Status, Requirement[]>

  const findColumn = useCallback((id: string): Status | null => {
    for (const status of COLUMNS) {
      if (columns[status].some((r) => r.id === id)) return status
    }
    return null
  }, [columns])

  const handleDragStart = (e: DragStartEvent) => {
    const req = allReqs.find((r) => r.id === e.active.id)
    setActiveReq(req || null)
    setIsDragging(true)
    lastCrossMoveRef.current = { col: req?.status ?? null, t: Date.now() }
    originSnapshotRef.current = allReqs.map((r) => ({ ...r }))
  }

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return
    if (overId === CANCEL_DROP_ID) return

    const activeCol = findColumn(activeId)
    const overCol = COLUMNS.includes(overId as Status) ? (overId as Status) : findColumn(overId)
    if (!activeCol || !overCol || activeCol === overCol) return

    // Cooldown guard — prevents jiggle when the pointer hovers the boundary
    // between two columns and collision detection oscillates between them.
    const now = Date.now()
    if (
      lastCrossMoveRef.current.col &&
      lastCrossMoveRef.current.col !== overCol &&
      now - lastCrossMoveRef.current.t < 220
    ) {
      return
    }
    lastCrossMoveRef.current = { col: overCol, t: now }

    // Live cross-column move: shift cards in the target column to make space
    queryClient.setQueriesData<{ data: Requirement[] } & Record<string, unknown>>(
      { queryKey: ['requirements'] },
      (old) => {
        if (!old?.data) return old
        const data = [...old.data]
        const activeIdx = data.findIndex((r) => r.id === activeId)
        if (activeIdx === -1) return old

        const moved = { ...data[activeIdx], status: overCol as Status }
        data.splice(activeIdx, 1)

        if (overId === overCol) {
          data.push(moved)
        } else {
          const overIdx = data.findIndex((r) => r.id === overId)
          data.splice(overIdx >= 0 ? overIdx : data.length, 0, moved)
        }

        return { ...old, data }
      },
    )
  }

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveReq(null)
    setIsDragging(false)
    const { active, over } = e
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Cancel drop — restore the snapshot taken at drag start, no API call.
    if (overId === CANCEL_DROP_ID) {
      const snapshot = originSnapshotRef.current
      if (snapshot) {
        queryClient.setQueriesData<{ data: Requirement[] } & Record<string, unknown>>(
          { queryKey: ['requirements'] },
          (old) => (old?.data ? { ...old, data: snapshot } : old),
        )
      }
      originSnapshotRef.current = null
      return
    }

    const activeCol = findColumn(activeId)
    const overCol = COLUMNS.includes(overId as Status) ? overId as Status : findColumn(overId)

    if (!activeCol || !overCol || activeId === overId) return

    const newItems: { id: string; position: number; status: string }[] = []

    if (activeCol === overCol) {
      const col = [...columns[activeCol]]
      const fromIdx = col.findIndex((r) => r.id === activeId)
      const toIdx = col.findIndex((r) => r.id === overId)
      if (fromIdx === -1 || toIdx === -1) return
      col.splice(fromIdx, 1)
      col.splice(toIdx, 0, allReqs.find((r) => r.id === activeId)!)
      col.forEach((r, i) => newItems.push({ id: r.id, position: i, status: activeCol }))
    } else {
      const sourceCol = columns[activeCol].filter((r) => r.id !== activeId)
      sourceCol.forEach((r, i) => newItems.push({ id: r.id, position: i, status: activeCol }))
      const targetCol = [...columns[overCol]]
      const toIdx = targetCol.findIndex((r) => r.id === overId)
      const movedReq = allReqs.find((r) => r.id === activeId)!
      if (toIdx === -1) targetCol.push(movedReq)
      else targetCol.splice(toIdx, 0, movedReq)
      targetCol.forEach((r, i) => newItems.push({ id: r.id, position: i, status: overCol }))
      newItems.push({ id: activeId, position: toIdx === -1 ? targetCol.length - 1 : toIdx, status: overCol })
    }

    // Optimistic cache update — so the drop animation lands in the new column
    const updates = new Map(newItems.map((i) => [i.id, i]))
    queryClient.setQueriesData<{ data: Requirement[] } & Record<string, unknown>>(
      { queryKey: ['requirements'] },
      (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((r) => {
            const u = updates.get(r.id)
            return u ? { ...r, position: u.position, status: u.status as Status } : r
          }),
        }
      },
    )

    try {
      await reorderFn(newItems)
    } catch {
      toast.error('Failed to save order')
      queryClient.invalidateQueries({ queryKey: ['requirements'] })
    }
  }

  const handleDragCancel = () => {
    setActiveReq(null)
    setIsDragging(false)
    lastCrossMoveRef.current = { col: null, t: 0 }
    const snapshot = originSnapshotRef.current
    if (snapshot) {
      queryClient.setQueriesData<{ data: Requirement[] } & Record<string, unknown>>(
        { queryKey: ['requirements'] },
        (old) => (old?.data ? { ...old, data: snapshot } : old),
      )
    }
    originSnapshotRef.current = null
  }

  return (
    <div className="h-full -m-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-3 h-full overflow-x-auto px-2 py-2">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              reqs={columns[status]}
              onCardClick={setSelectedReq}
              onAdd={setAddToStatus}
              canCreate={canCreate}
              isDraggingGlobal={isDragging}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={dropAnimation}>
          {activeReq && <KanbanCard req={activeReq} onClick={() => {}} overlay />}
        </DragOverlay>
        <CancelDropZone visible={isDragging} />
      </DndContext>

      {addToStatus && (
        <RequirementModal defaultStatus={addToStatus} onClose={() => setAddToStatus(null)} />
      )}
      {selectedReq && (
        <RequirementPanel requirement={selectedReq} onClose={() => setSelectedReq(null)} />
      )}
    </div>
  )
}
