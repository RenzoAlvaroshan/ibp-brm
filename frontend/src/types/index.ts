export type Role = 'admin' | 'editor' | 'viewer'
export type Status = 'todo' | 'requirement_gathering' | 'development' | 'sit' | 'uat' | 'd2p' | 'production_test' | 'completed'
export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'

export interface User {
  id: string
  email: string
  full_name: string
  role: Role
  avatar_url: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Comment {
  id: string
  requirement_id: string
  author_id: string
  author?: User
  body: string
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  requirement_id: string
  requirement_title?: string
  actor_id: string
  actor?: User
  action: string
  meta: string
  created_at: string
}

export interface Requirement {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  created_by_id: string
  created_by?: User
  assigned_to_id?: string
  assigned_to?: User
  due_date?: string
  position: number
  tags?: Tag[]
  comments?: Comment[]
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  message: string
  link: string
  is_read: boolean
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface DashboardMetrics {
  total: number
  approved: number
  in_review: number
  critical_open: number
  by_status: { status: Status; count: number }[]
  by_priority: { priority: Priority; count: number }[]
  recent_activity: ActivityLog[]
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface ApiError {
  error: string
  code: string
}

export interface App {
  id: string
  name: string
  description: string
  users?: User[]
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  requirement_id: string
  requirement?: Requirement
  title: string
  description: string
  status: TaskStatus
  target_date?: string
  app_id?: string
  app?: App
  created_at: string
  updated_at: string
}

export interface DashboardFilters {
  from_date?:  string
  to_date?:    string
  statuses?:   Status[]
  priorities?: Priority[]
  tag_ids?:    string[]
}

export interface RequirementFilters {
  status?: Status
  priority?: Priority
  tag?: string
  assignee?: string
  search?: string
  sort?: string
  dir?: 'asc' | 'desc'
  page?: number
  limit?: number
}
