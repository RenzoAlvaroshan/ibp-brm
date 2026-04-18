/**
 * useApi — returns typed API functions that work in both real and demo mode.
 * All pages should use these hooks instead of calling api endpoints directly.
 */
import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'
import { useDemoStore } from '@/store/demo'
import { useAuthStore } from '@/store/auth'
import { requirementsApi, tagsApi, commentsApi, tasksApi, appsApi } from '@/api/endpoints'
import type { Requirement, Tag, Comment, RequirementFilters, Task } from '@/types'
import {
  mockMetrics, mockNotifications, mockUsers, mockActivity,
} from '@/api/mockData'

// ─── Requirements ─────────────────────────────────────────────────────────────

export function useRequirementsQuery(filters?: RequirementFilters) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  if (!isDemoMode) {
    return { queryKey: ['requirements', filters], queryFn: () => requirementsApi.list(filters).then((r) => r.data) }
  }

  return {
    queryKey: ['requirements', filters, 'demo'],
    queryFn: async () => {
      let reqs = [...useDemoStore.getState().requirements]
      if (filters?.status) reqs = reqs.filter((r) => r.status === filters.status)
      if (filters?.priority) reqs = reqs.filter((r) => r.priority === filters.priority)
      if (filters?.search) {
        const s = filters.search.toLowerCase()
        reqs = reqs.filter((r) => r.title.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s))
      }
      if (filters?.assignee) reqs = reqs.filter((r) => r.assigned_to_id === filters.assignee)
      if (filters?.tag) reqs = reqs.filter((r) => r.tags?.some((t) => t.id === filters.tag))

      const sort = filters?.sort || 'created_at'
      const dir = filters?.dir || 'desc'
      reqs.sort((a, b) => {
        const av = (a as any)[sort] || ''
        const bv = (b as any)[sort] || ''
        return dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      })

      const page = filters?.page || 1
      const limit = filters?.limit || 50
      const start = (page - 1) * limit
      return { data: reqs.slice(start, start + limit), total: reqs.length, page, limit }
    },
  }
}

export function useRequirementQuery(id: string) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  if (!isDemoMode) {
    return { queryKey: ['requirement', id], queryFn: () => requirementsApi.get(id).then((r) => r.data) }
  }
  return {
    queryKey: ['requirement', id, 'demo'],
    queryFn: async () => useDemoStore.getState().requirements.find((r) => r.id === id) as Requirement,
  }
}

export function useCreateRequirement() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const addRequirement = useDemoStore((s) => s.addRequirement)
  const demoTags = useDemoStore((s) => s.tags)
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  return useCallback(
    async (data: Partial<Requirement> & { tag_ids?: string[] }) => {
      if (!isDemoMode) {
        const res = await requirementsApi.create(data)
        qc.invalidateQueries({ queryKey: ['requirements'] })
        return res.data
      }
      const tags = demoTags.filter((t) => data.tag_ids?.includes(t.id))
      const now = new Date().toISOString()
      const newReq: Requirement = {
        id: uuid(),
        title: data.title || 'Untitled',
        description: data.description || '',
        status: (data.status as Requirement['status']) || 'draft',
        priority: (data.priority as Requirement['priority']) || 'medium',
        created_by_id: user?.id || 'u1',
        created_by: user || undefined,
        assigned_to_id: data.assigned_to_id || undefined,
        assigned_to: data.assigned_to_id ? mockUsers.find((u) => u.id === data.assigned_to_id) : undefined,
        due_date: data.due_date,
        position: 0,
        tags,
        comments: [],
        created_at: now,
        updated_at: now,
      }
      addRequirement(newReq)
      qc.invalidateQueries({ queryKey: ['requirements'] })
      return newReq
    },
    [isDemoMode, addRequirement, demoTags, user, qc]
  )
}

export function useUpdateRequirement() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const updateRequirement = useDemoStore((s) => s.updateRequirement)
  const demoTags = useDemoStore((s) => s.tags)
  const qc = useQueryClient()

  return useCallback(
    async (id: string, data: Partial<Requirement> & { tag_ids?: string[] }) => {
      if (!isDemoMode) {
        const res = await requirementsApi.update(id, data)
        qc.invalidateQueries({ queryKey: ['requirements'] })
        qc.invalidateQueries({ queryKey: ['requirement', id] })
        return res.data
      }
      const patch: Partial<Requirement> = { ...data, updated_at: new Date().toISOString() }
      if (data.tag_ids !== undefined) {
        patch.tags = demoTags.filter((t) => data.tag_ids!.includes(t.id))
      }
      if (data.assigned_to_id !== undefined) {
        patch.assigned_to = mockUsers.find((u) => u.id === data.assigned_to_id)
      }
      updateRequirement(id, patch)
      qc.invalidateQueries({ queryKey: ['requirements'] })
      qc.invalidateQueries({ queryKey: ['requirement', id] })
    },
    [isDemoMode, updateRequirement, demoTags, qc]
  )
}

export function useDeleteRequirement() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const deleteRequirement = useDemoStore((s) => s.deleteRequirement)
  const qc = useQueryClient()

  return useCallback(
    async (id: string) => {
      if (!isDemoMode) {
        await requirementsApi.delete(id)
      } else {
        deleteRequirement(id)
      }
      qc.invalidateQueries({ queryKey: ['requirements'] })
    },
    [isDemoMode, deleteRequirement, qc]
  )
}

export function useReorderRequirements() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const reorder = useDemoStore((s) => s.reorderRequirements)
  const qc = useQueryClient()

  return useCallback(
    async (items: { id: string; position: number; status: string }[]) => {
      if (!isDemoMode) {
        await requirementsApi.reorder(items)
      } else {
        reorder(items)
        qc.invalidateQueries({ queryKey: ['requirements'] })
      }
    },
    [isDemoMode, reorder, qc]
  )
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export function useTagsQuery() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const demoTags = useDemoStore((s) => s.tags)
  if (!isDemoMode) {
    return { queryKey: ['tags'], queryFn: () => tagsApi.list().then((r) => r.data) }
  }
  return { queryKey: ['tags', 'demo'], queryFn: async () => demoTags }
}

export function useCreateTag() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const addTag = useDemoStore((s) => s.addTag)
  const qc = useQueryClient()

  return useCallback(
    async (data: { name: string; color: string }) => {
      if (!isDemoMode) {
        const res = await tagsApi.create(data)
        qc.invalidateQueries({ queryKey: ['tags'] })
        return res.data
      }
      const tag: Tag = { id: uuid(), ...data }
      addTag(tag)
      qc.invalidateQueries({ queryKey: ['tags'] })
      return tag
    },
    [isDemoMode, addTag, qc]
  )
}

export function useDeleteTag() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const deleteTag = useDemoStore((s) => s.deleteTag)
  const qc = useQueryClient()

  return useCallback(
    async (id: string) => {
      if (!isDemoMode) {
        await tagsApi.delete(id)
      } else {
        deleteTag(id)
      }
      qc.invalidateQueries({ queryKey: ['tags'] })
    },
    [isDemoMode, deleteTag, qc]
  )
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export function useActivityQuery(requirementId: string) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  if (!isDemoMode) {
    return {
      queryKey: ['activity', requirementId],
      queryFn: () => commentsApi.activity(requirementId).then((r) => r.data),
    }
  }
  return {
    queryKey: ['activity', requirementId, 'demo'],
    queryFn: async () => mockActivity.filter((a) => a.requirement_id === requirementId),
  }
}

export function useCreateComment() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const addComment = useDemoStore((s) => s.addComment)
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  return useCallback(
    async (requirementId: string, body: string) => {
      if (!isDemoMode) {
        const res = await commentsApi.create(requirementId, body)
        qc.invalidateQueries({ queryKey: ['requirement', requirementId] })
        qc.invalidateQueries({ queryKey: ['activity', requirementId] })
        return res.data
      }
      const now = new Date().toISOString()
      const comment: Comment = {
        id: uuid(),
        requirement_id: requirementId,
        author_id: user?.id || 'u1',
        author: user || undefined,
        body,
        created_at: now,
        updated_at: now,
      }
      addComment(comment)
      qc.invalidateQueries({ queryKey: ['requirement', requirementId] })
      return comment
    },
    [isDemoMode, addComment, user, qc]
  )
}

export function useDeleteComment() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const deleteComment = useDemoStore((s) => s.deleteComment)
  const qc = useQueryClient()

  return useCallback(
    async (id: string, requirementId?: string) => {
      if (!isDemoMode) {
        await commentsApi.delete(id)
      } else {
        deleteComment(id)
      }
      if (requirementId) qc.invalidateQueries({ queryKey: ['requirement', requirementId] })
    },
    [isDemoMode, deleteComment, qc]
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useDashboardQuery(filters?: import('@/types').DashboardFilters) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const demoReqs = useDemoStore((s) => s.requirements)

  const apiParams: Record<string, string | undefined> = {
    from_date:  filters?.from_date,
    to_date:    filters?.to_date,
    statuses:   filters?.statuses?.length   ? filters.statuses.join(',')   : undefined,
    priorities: filters?.priorities?.length ? filters.priorities.join(',') : undefined,
    tag_ids:    filters?.tag_ids?.length    ? filters.tag_ids.join(',')    : undefined,
  }

  if (!isDemoMode) {
    return {
      queryKey: ['dashboard-metrics', filters],
      queryFn: async () => {
        const { dashboardApi } = await import('@/api/endpoints')
        return dashboardApi.metrics(apiParams).then((r) => r.data)
      },
    }
  }

  return {
    queryKey: ['dashboard-metrics', 'demo', demoReqs.length, filters],
    queryFn: async () => {
      let reqs = useDemoStore.getState().requirements
      if (filters?.from_date)        reqs = reqs.filter((r) => r.created_at >= filters.from_date! + 'T00:00:00')
      if (filters?.to_date)          reqs = reqs.filter((r) => r.created_at <= filters.to_date! + 'T23:59:59')
      if (filters?.statuses?.length)   reqs = reqs.filter((r) => filters.statuses!.includes(r.status))
      if (filters?.priorities?.length) reqs = reqs.filter((r) => filters.priorities!.includes(r.priority))
      if (filters?.tag_ids?.length)    reqs = reqs.filter((r) => r.tags?.some((t) => filters.tag_ids!.includes(t.id)))

      return {
        ...mockMetrics,
        total: reqs.length,
        approved: reqs.filter((r) => r.status === 'completed').length,
        in_review: reqs.filter((r) => ['development', 'sit', 'uat'].includes(r.status)).length,
        critical_open: reqs.filter((r) => r.priority === 'critical' && r.status !== 'completed').length,
        by_status: ['todo', 'requirement_gathering', 'development', 'sit', 'uat', 'd2p', 'production_test', 'completed'].map((s) => ({
          status: s as any,
          count: reqs.filter((r) => r.status === s).length,
        })),
        by_priority: ['critical', 'high', 'medium', 'low'].map((p) => ({
          priority: p as any,
          count: reqs.filter((r) => r.priority === p).length,
        })),
        recent_activity: mockMetrics.recent_activity,
      }
    },
  }
}

export function useMyRequirementsQuery() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const demoReqs = useDemoStore((s) => s.requirements)
  const user = useAuthStore((s) => s.user)

  if (!isDemoMode) {
    return {
      queryKey: ['my-requirements'],
      queryFn: async () => {
        const { dashboardApi } = await import('@/api/endpoints')
        return dashboardApi.myRequirements().then((r) => r.data)
      },
    }
  }
  return {
    queryKey: ['my-requirements', 'demo'],
    queryFn: async () => demoReqs.filter((r) => r.assigned_to_id === user?.id).slice(0, 5),
  }
}

export function useNotificationsQuery() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  if (!isDemoMode) {
    return {
      queryKey: ['notifications'],
      queryFn: async () => {
        const { notificationsApi } = await import('@/api/endpoints')
        return notificationsApi.list().then((r) => r.data)
      },
    }
  }
  return {
    queryKey: ['notifications', 'demo'],
    queryFn: async () => ({ notifications: mockNotifications, unread_count: mockNotifications.filter((n) => !n.is_read).length }),
  }
}

export function useUsersQuery() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  if (!isDemoMode) {
    return {
      queryKey: ['users-list'],
      queryFn: async () => {
        const { usersApi } = await import('@/api/endpoints')
        return usersApi.list().then((r) => r.data)
      },
    }
  }
  return { queryKey: ['users-list', 'demo'], queryFn: async () => mockUsers }
}

// ─── Apps ─────────────────────────────────────────────────────────────────────

export function useAppsQuery() {
  return {
    queryKey: ['apps'],
    queryFn: () => appsApi.list().then((r) => r.data),
  }
}

export function useCreateApp() {
  const qc = useQueryClient()
  return useCallback(
    async (data: { name: string; description: string }) => {
      const res = await appsApi.create(data)
      qc.invalidateQueries({ queryKey: ['apps'] })
      return res.data
    },
    [qc]
  )
}

export function useUpdateApp() {
  const qc = useQueryClient()
  return useCallback(
    async (id: string, data: { name?: string; description?: string }) => {
      const res = await appsApi.update(id, data)
      qc.invalidateQueries({ queryKey: ['apps'] })
      return res.data
    },
    [qc]
  )
}

export function useDeleteApp() {
  const qc = useQueryClient()
  return useCallback(
    async (id: string) => {
      await appsApi.delete(id)
      qc.invalidateQueries({ queryKey: ['apps'] })
    },
    [qc]
  )
}

export function useAddAppUser() {
  const qc = useQueryClient()
  return useCallback(
    async (appId: string, userId: string) => {
      const res = await appsApi.addUser(appId, userId)
      qc.invalidateQueries({ queryKey: ['apps'] })
      return res.data
    },
    [qc]
  )
}

export function useRemoveAppUser() {
  const qc = useQueryClient()
  return useCallback(
    async (appId: string, userId: string) => {
      const res = await appsApi.removeUser(appId, userId)
      qc.invalidateQueries({ queryKey: ['apps'] })
      return res.data
    },
    [qc]
  )
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function useAllTasksQuery(filters?: { status?: string; app_id?: string; search?: string }) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  if (isDemoMode) {
    return {
      queryKey: ['tasks-all', filters, 'demo'],
      queryFn: async (): Promise<Task[]> => {
        let tasks = Object.values(useDemoStore.getState().tasks).flat()
        if (filters?.status) tasks = tasks.filter((t) => t.status === filters.status)
        if (filters?.app_id) tasks = tasks.filter((t) => t.app_id === filters.app_id)
        if (filters?.search) {
          const s = filters.search.toLowerCase()
          tasks = tasks.filter((t) => t.title.toLowerCase().includes(s))
        }
        return tasks.sort((a, b) => {
          if (!a.target_date && !b.target_date) return 0
          if (!a.target_date) return 1
          if (!b.target_date) return -1
          return a.target_date.localeCompare(b.target_date)
        })
      },
    }
  }
  return {
    queryKey: ['tasks-all', filters],
    queryFn: () => tasksApi.listAll(filters).then((r) => r.data),
  }
}

export function useTasksQuery(requirementId: string) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  if (isDemoMode) {
    return {
      queryKey: ['tasks', requirementId, 'demo'],
      queryFn: async (): Promise<Task[]> => useDemoStore.getState().tasks[requirementId] ?? [],
    }
  }
  return {
    queryKey: ['tasks', requirementId],
    queryFn: () => tasksApi.list(requirementId).then((r) => r.data),
  }
}

export function useCreateTask() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const addTask = useDemoStore((s) => s.addTask)
  const qc = useQueryClient()
  return useCallback(
    async (requirementId: string, data: Partial<Task> & { target_date?: string; app_id?: string }) => {
      if (!isDemoMode) {
        const res = await tasksApi.create(requirementId, data)
        qc.invalidateQueries({ queryKey: ['tasks', requirementId] })
        qc.invalidateQueries({ queryKey: ['tasks-all'] })
        return res.data
      }
      const now = new Date().toISOString()
      const task: Task = {
        id: uuid(),
        requirement_id: requirementId,
        title: data.title || 'Untitled',
        description: data.description || '',
        status: (data.status as Task['status']) || 'todo',
        target_date: data.target_date || undefined,
        app_id: data.app_id || undefined,
        created_at: now,
        updated_at: now,
      }
      addTask(task)
      qc.invalidateQueries({ queryKey: ['tasks', requirementId] })
      qc.invalidateQueries({ queryKey: ['tasks-all'] })
      return task
    },
    [isDemoMode, addTask, qc]
  )
}

export function useUpdateTask() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const updateDemoTask = useDemoStore((s) => s.updateTask)
  const qc = useQueryClient()
  return useCallback(
    async (id: string, requirementId: string, data: Partial<Task> & { target_date?: string; app_id?: string }) => {
      if (!isDemoMode) {
        const res = await tasksApi.update(id, data)
        qc.invalidateQueries({ queryKey: ['tasks', requirementId] })
        return res.data
      }
      updateDemoTask(id, requirementId, { ...data, updated_at: new Date().toISOString() })
      qc.invalidateQueries({ queryKey: ['tasks', requirementId] })
      qc.invalidateQueries({ queryKey: ['tasks-all'] })
    },
    [isDemoMode, updateDemoTask, qc]
  )
}

export function useDeleteTask() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const deleteDemoTask = useDemoStore((s) => s.deleteTask)
  const qc = useQueryClient()
  return useCallback(
    async (id: string, requirementId: string) => {
      if (!isDemoMode) {
        await tasksApi.delete(id)
      } else {
        deleteDemoTask(id, requirementId)
      }
      qc.invalidateQueries({ queryKey: ['tasks', requirementId] })
      qc.invalidateQueries({ queryKey: ['tasks-all'] })
    },
    [isDemoMode, deleteDemoTask, qc]
  )
}
