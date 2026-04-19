import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Requirement, Tag, Comment, Task } from '@/types'
import { mockRequirements, mockTags, mockTasks } from '@/api/mockData'

interface DemoState {
  isDemoMode: boolean
  requirements: Requirement[]
  tags: Tag[]
  tasks: Record<string, Task[]>
  setDemoMode: (v: boolean) => void
  addRequirement: (r: Requirement) => void
  updateRequirement: (id: string, patch: Partial<Requirement>) => void
  deleteRequirement: (id: string) => void
  reorderRequirements: (items: { id: string; position: number; status: string }[]) => void
  addTag: (t: Tag) => void
  deleteTag: (id: string) => void
  addComment: (c: Comment) => void
  deleteComment: (id: string) => void
  addTask: (t: Task) => void
  updateTask: (id: string, requirementId: string, patch: Partial<Task>) => void
  deleteTask: (id: string, requirementId: string) => void
  reorderTasks: (requirementId: string, orderedIds: string[]) => void
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      isDemoMode: false,
      requirements: mockRequirements,
      tags: mockTags,
      tasks: mockTasks,

      setDemoMode: (v) =>
        set({ isDemoMode: v, requirements: [...mockRequirements], tags: [...mockTags], tasks: { ...mockTasks } }),

      addRequirement: (r) =>
        set((s) => ({ requirements: [r, ...s.requirements] })),

      updateRequirement: (id, patch) =>
        set((s) => ({
          requirements: s.requirements.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      deleteRequirement: (id) =>
        set((s) => ({ requirements: s.requirements.filter((r) => r.id !== id) })),

      reorderRequirements: (items) =>
        set((s) => {
          const map = Object.fromEntries(items.map((i) => [i.id, i]))
          return {
            requirements: s.requirements.map((r) =>
              map[r.id]
                ? { ...r, position: map[r.id].position, status: map[r.id].status as Requirement['status'] }
                : r
            ),
          }
        }),

      addTag: (t) => set((s) => ({ tags: [...s.tags, t] })),

      deleteTag: (id) => set((s) => ({ tags: s.tags.filter((t) => t.id !== id) })),

      addComment: (c) =>
        set((s) => ({
          requirements: s.requirements.map((r) =>
            r.id === c.requirement_id
              ? { ...r, comments: [...(r.comments || []), c] }
              : r
          ),
        })),

      deleteComment: (id) =>
        set((s) => ({
          requirements: s.requirements.map((r) => ({
            ...r,
            comments: (r.comments || []).filter((c) => c.id !== id),
          })),
        })),

      addTask: (t) =>
        set((s) => ({
          tasks: {
            ...s.tasks,
            [t.requirement_id]: [...(s.tasks[t.requirement_id] ?? []), t],
          },
        })),

      updateTask: (id, requirementId, patch) =>
        set((s) => ({
          tasks: {
            ...s.tasks,
            [requirementId]: (s.tasks[requirementId] ?? []).map((t) =>
              t.id === id ? { ...t, ...patch } : t
            ),
          },
        })),

      deleteTask: (id, requirementId) =>
        set((s) => ({
          tasks: {
            ...s.tasks,
            [requirementId]: (s.tasks[requirementId] ?? []).filter((t) => t.id !== id),
          },
        })),

      reorderTasks: (requirementId, orderedIds) =>
        set((s) => {
          const existing = s.tasks[requirementId] ?? []
          const byId = new Map(existing.map((t) => [t.id, t]))
          const reordered = orderedIds
            .map((id) => byId.get(id))
            .filter((t): t is Task => !!t)
          const extras = existing.filter((t) => !orderedIds.includes(t.id))
          return {
            tasks: { ...s.tasks, [requirementId]: [...reordered, ...extras] },
          }
        }),
    }),
    { name: 'brm-demo-v2', partialize: (state) => ({ isDemoMode: state.isDemoMode }) }
  )
)
