import { useQuery } from '@tanstack/react-query'
import {
  DndContext, DragEndEvent, PointerSensor,
  closestCenter, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Circle, CheckCircle2, Zap, XOctagon,
  GripVertical, Calendar,
} from 'lucide-react'
import type { Task, TaskStatus, Requirement } from '@/types'
import { useTasksQuery, useReorderTasks } from '@/hooks/useApi'
import { cn, formatDate } from '@/utils'

const STATUS_CONFIG: Record<TaskStatus, {
  label: string
  icon: React.ElementType
  dot: string
  chipBg: string
  chipText: string
}> = {
  todo:        { label: 'To Do',      icon: Circle,        dot: '#9ca3af', chipBg: 'bg-gray-100',    chipText: 'text-gray-600' },
  in_progress: { label: 'In Progress',icon: Zap,           dot: '#6366f1', chipBg: 'bg-violet-50',   chipText: 'text-violet-700' },
  blocked:     { label: 'Blocked',    icon: XOctagon,      dot: '#ef4444', chipBg: 'bg-red-50',      chipText: 'text-red-600' },
  done:        { label: 'Done',       icon: CheckCircle2,  dot: '#10b981', chipBg: 'bg-emerald-50',  chipText: 'text-emerald-700' },
}

function TaskSubrow({
  task, draggable, onClick,
}: {
  task: Task
  draggable: boolean
  onClick?: (task: Task) => void
}) {
  const sortable = useSortable({ id: task.id, disabled: !draggable })
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable

  const cfg = STATUS_CONFIG[task.status]
  const Icon = cfg.icon
  const isDone = task.status === 'done'

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : undefined,
      }}
      onClick={(e) => { e.stopPropagation(); onClick?.(task) }}
      className={cn(
        'group flex items-center gap-2 px-2 py-1.5 rounded-md',
        'hover:bg-gray-50 cursor-pointer transition-colors',
      )}
    >
      {draggable && (
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
          className="shrink-0 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={12} />
        </button>
      )}

      <Icon size={13} style={{ color: cfg.dot }} strokeWidth={2.25} className="shrink-0" />

      <span className={cn(
        'flex-1 min-w-0 text-[12.5px] truncate',
        isDone ? 'text-gray-400 line-through' : 'text-gray-700',
      )}>
        {task.title}
      </span>

      <span className={cn(
        'hidden sm:inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0',
        cfg.chipBg, cfg.chipText,
      )}>
        {cfg.label}
      </span>

      {task.app && (
        <span className="hidden md:inline-flex text-[10px] text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md font-medium shrink-0 max-w-[110px] truncate">
          {task.app.name}
        </span>
      )}

      {task.target_date && (
        <span className="hidden md:inline-flex items-center gap-1 text-[10.5px] text-gray-400 shrink-0">
          <Calendar size={10} />
          {formatDate(task.target_date)}
        </span>
      )}
    </div>
  )
}

export default function TaskSubrowList({
  requirement, draggable = true, onTaskClick,
}: {
  requirement: Requirement
  draggable?: boolean
  onTaskClick?: (task: Task) => void
}) {
  const tasksQuery = useTasksQuery(requirement.id)
  const { data: tasks = [], isLoading } = useQuery(tasksQuery)
  const reorderTasks = useReorderTasks()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = tasks.findIndex((t) => t.id === active.id)
    const newIdx = tasks.findIndex((t) => t.id === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    const ordered = arrayMove(tasks, oldIdx, newIdx).map((t) => t.id)
    reorderTasks(requirement.id, ordered)
  }

  if (isLoading) {
    return <div className="px-2 py-1.5 text-[12px] text-gray-400">Loading tasks…</div>
  }

  if (tasks.length === 0) {
    return (
      <div className="px-2 py-1.5 text-[12px] text-gray-400 italic">
        No subtasks yet.
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col">
          {tasks.map((t) => (
            <TaskSubrow key={t.id} task={t} draggable={draggable} onClick={onTaskClick} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
