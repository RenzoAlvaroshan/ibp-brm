import { apiClient } from './client'
import type {
  AuthResponse,
  Comment,
  DashboardMetrics,
  Notification,
  PaginatedResponse,
  Requirement,
  RequirementFilters,
  Tag,
  User,
} from '@/types'

// Auth
export const authApi = {
  register: (data: { email: string; password: string; full_name: string }) =>
    apiClient.post<AuthResponse>('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/api/auth/login', data),
  refresh: (refresh_token: string) =>
    apiClient.post<{ access_token: string; refresh_token: string }>('/api/auth/refresh', { refresh_token }),
  logout: () => apiClient.post('/api/auth/logout'),
  me: () => apiClient.get<User>('/api/auth/me'),
  updateProfile: (data: { full_name?: string; avatar_url?: string }) =>
    apiClient.put<User>('/api/auth/profile', data),
  changePassword: (data: { old_password: string; new_password: string }) =>
    apiClient.post('/api/auth/change-password', data),
}

// Requirements
export const requirementsApi = {
  list: (filters?: RequirementFilters) =>
    apiClient.get<PaginatedResponse<Requirement>>('/api/requirements', { params: filters }),
  get: (id: string) => apiClient.get<Requirement>(`/api/requirements/${id}`),
  create: (data: Partial<Requirement> & { tag_ids?: string[] }) =>
    apiClient.post<Requirement>('/api/requirements', data),
  update: (id: string, data: Partial<Requirement> & { tag_ids?: string[] }) =>
    apiClient.put<Requirement>(`/api/requirements/${id}`, data),
  patch: (id: string, data: Partial<Requirement> & { tag_ids?: string[] }) =>
    apiClient.patch<Requirement>(`/api/requirements/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/requirements/${id}`),
  reorder: (items: { id: string; position: number; status: string }[]) =>
    apiClient.patch('/api/requirements/reorder', { items }),
  exportCsv: (filters?: RequirementFilters) =>
    apiClient.get('/api/requirements/export/csv', {
      params: filters,
      responseType: 'blob',
    }),
}

// Comments
export const commentsApi = {
  list: (requirementId: string) =>
    apiClient.get<Comment[]>(`/api/requirements/${requirementId}/comments`),
  create: (requirementId: string, body: string) =>
    apiClient.post<Comment>(`/api/requirements/${requirementId}/comments`, { body }),
  delete: (id: string) => apiClient.delete(`/api/comments/${id}`),
  activity: (requirementId: string) =>
    apiClient.get(`/api/requirements/${requirementId}/activity`),
}

// Tags
export const tagsApi = {
  list: () => apiClient.get<Tag[]>('/api/tags'),
  create: (data: { name: string; color: string }) =>
    apiClient.post<Tag>('/api/tags', data),
  delete: (id: string) => apiClient.delete(`/api/tags/${id}`),
}

// Users
export const usersApi = {
  list: () => apiClient.get<User[]>('/api/users'),
  updateRole: (id: string, role: string) =>
    apiClient.patch(`/api/users/${id}/role`, { role }),
  invite: (data: { email: string; full_name: string; role?: string }) =>
    apiClient.post('/api/users/invite', data),
}

// Dashboard
export const dashboardApi = {
  metrics: () => apiClient.get<DashboardMetrics>('/api/dashboard/metrics'),
  myRequirements: () => apiClient.get<Requirement[]>('/api/dashboard/my-requirements'),
}

// Notifications
export const notificationsApi = {
  list: () =>
    apiClient.get<{ notifications: Notification[]; unread_count: number }>('/api/notifications'),
  markRead: (id: string) => apiClient.patch(`/api/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/api/notifications/read-all'),
}
