import type { Requirement, User, Tag, Comment, ActivityLog, DashboardMetrics, Notification } from '@/types'

export const mockUsers: User[] = [
  { id: 'u1', email: 'admin@brm.app', full_name: 'Alex Admin', role: 'admin', avatar_url: '', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'u2', email: 'editor@brm.app', full_name: 'Emily Editor', role: 'editor', avatar_url: '', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'u3', email: 'viewer@brm.app', full_name: 'Victor Viewer', role: 'viewer', avatar_url: '', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
]

export const mockTags: Tag[] = [
  { id: 't1', name: 'Enterprise',    color: '#6366F1' },
  { id: 't2', name: 'Wholesale',     color: '#10B981' },
  { id: 't3', name: 'Consumer',      color: '#F59E0B' },
  { id: 't4', name: 'Connectivity',  color: '#3B82F6' },
  { id: 't5', name: 'Digital',       color: '#EC4899' },
]

export const mockComments: Comment[] = [
  { id: 'c1', requirement_id: 'r1', author_id: 'u2', author: mockUsers[1], body: 'This needs to support OAuth2 as well.', created_at: '2024-02-10T10:00:00Z', updated_at: '2024-02-10T10:00:00Z' },
  { id: 'c2', requirement_id: 'r1', author_id: 'u1', author: mockUsers[0], body: 'Agreed, adding that to the scope.', created_at: '2024-02-11T09:00:00Z', updated_at: '2024-02-11T09:00:00Z' },
]

export const mockActivity: ActivityLog[] = [
  { id: 'a1', requirement_id: 'r1', actor_id: 'u1', actor: mockUsers[0], action: 'status_changed', meta: '{"from":"draft","to":"approved"}', created_at: '2024-02-12T08:00:00Z' },
  { id: 'a2', requirement_id: 'r1', actor_id: 'u2', actor: mockUsers[1], action: 'comment_added', meta: '{}', created_at: '2024-02-10T10:00:00Z' },
  { id: 'a3', requirement_id: 'r2', actor_id: 'u1', actor: mockUsers[0], action: 'created', meta: '{}', created_at: '2024-02-09T14:00:00Z' },
]

export const mockRequirements: Requirement[] = [
  {
    id: 'r1', title: 'User Authentication System',
    description: 'Implement secure JWT-based authentication with refresh tokens, role-based access control, and password reset functionality.',
    status: 'completed', priority: 'critical',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    due_date: '2024-03-15T00:00:00Z', position: 0,
    tags: [mockTags[0], mockTags[3]],
    comments: mockComments,
    created_at: '2024-01-15T00:00:00Z', updated_at: '2024-02-12T00:00:00Z',
  },
  {
    id: 'r2', title: 'Dashboard Analytics Integration',
    description: 'Integrate recharts for displaying real-time business metrics including requirement counts, status distribution, and team performance.',
    status: 'development', priority: 'high',
    created_by_id: 'u2', created_by: mockUsers[1],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: '2024-04-01T00:00:00Z', position: 1,
    tags: [mockTags[0]],
    comments: [],
    created_at: '2024-01-20T00:00:00Z', updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'r3', title: 'Export to CSV/PDF Feature',
    description: 'Allow users to export requirements list to CSV and PDF formats with applied filters preserved.',
    status: 'requirement_gathering', priority: 'medium',
    created_by_id: 'u2', created_by: mockUsers[1],
    position: 2, tags: [mockTags[1]],
    comments: [],
    created_at: '2024-02-01T00:00:00Z', updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'r4', title: 'Email Notification System',
    description: 'Send email notifications when requirement status changes, new comments are added, or assignments change.',
    status: 'todo', priority: 'medium',
    created_by_id: 'u1', created_by: mockUsers[0],
    position: 3, tags: [mockTags[1], mockTags[2]],
    comments: [],
    created_at: '2024-02-03T00:00:00Z', updated_at: '2024-02-03T00:00:00Z',
  },
  {
    id: 'r5', title: 'Kanban Drag-and-Drop',
    description: 'Implement drag-and-drop using @dnd-kit. Persist position and status changes to backend.',
    status: 'sit', priority: 'high',
    created_by_id: 'u2', created_by: mockUsers[1],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    due_date: '2024-03-30T00:00:00Z', position: 4,
    tags: [mockTags[0], mockTags[4]],
    comments: [],
    created_at: '2024-02-05T00:00:00Z', updated_at: '2024-02-05T00:00:00Z',
  },
  {
    id: 'r6', title: 'Performance Optimization Review',
    description: 'Review and optimize database queries, add proper indexes, and implement query caching.',
    status: 'uat', priority: 'low',
    created_by_id: 'u3', created_by: mockUsers[2],
    position: 5, tags: [mockTags[4]],
    comments: [],
    created_at: '2024-02-08T00:00:00Z', updated_at: '2024-02-08T00:00:00Z',
  },
  {
    id: 'r7', title: 'Multi-language Support (i18n)',
    description: 'Add internationalization support for English, Spanish, and French using react-i18next.',
    status: 'todo', priority: 'low',
    created_by_id: 'u1', created_by: mockUsers[0],
    position: 6, tags: [mockTags[0]],
    comments: [],
    created_at: '2024-02-10T00:00:00Z', updated_at: '2024-02-10T00:00:00Z',
  },
  {
    id: 'r8', title: 'Role Permission Audit Trail',
    description: 'Log all permission changes and sensitive actions to a separate audit log table.',
    status: 'production_test', priority: 'high',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    position: 7, tags: [mockTags[3]],
    comments: [],
    created_at: '2024-02-12T00:00:00Z', updated_at: '2024-02-12T00:00:00Z',
  },
]

export const mockMetrics: DashboardMetrics = {
  total: mockRequirements.length,
  approved: mockRequirements.filter(r => r.status === 'completed').length,
  in_review: mockRequirements.filter(r => r.status === 'development' || r.status === 'sit' || r.status === 'uat').length,
  critical_open: mockRequirements.filter(r => r.priority === 'critical' && r.status !== 'completed').length,
  by_status: [
    { status: 'todo', count: mockRequirements.filter(r => r.status === 'todo').length },
    { status: 'requirement_gathering', count: mockRequirements.filter(r => r.status === 'requirement_gathering').length },
    { status: 'development', count: mockRequirements.filter(r => r.status === 'development').length },
    { status: 'sit', count: mockRequirements.filter(r => r.status === 'sit').length },
    { status: 'uat', count: mockRequirements.filter(r => r.status === 'uat').length },
    { status: 'd2p', count: mockRequirements.filter(r => r.status === 'd2p').length },
    { status: 'production_test', count: mockRequirements.filter(r => r.status === 'production_test').length },
    { status: 'completed', count: mockRequirements.filter(r => r.status === 'completed').length },
  ],
  by_priority: [
    { priority: 'critical', count: mockRequirements.filter(r => r.priority === 'critical').length },
    { priority: 'high', count: mockRequirements.filter(r => r.priority === 'high').length },
    { priority: 'medium', count: mockRequirements.filter(r => r.priority === 'medium').length },
    { priority: 'low', count: mockRequirements.filter(r => r.priority === 'low').length },
  ],
  recent_activity: [
    { ...mockActivity[0], requirement_title: 'User Authentication System' },
    { ...mockActivity[1], requirement_title: 'User Authentication System' },
    { ...mockActivity[2], requirement_title: 'Dashboard Analytics Integration' },
  ],
}

export const mockNotifications: Notification[] = [
  { id: 'n1', user_id: 'u1', message: 'User Authentication System status changed to approved', link: '/requirements', is_read: false, created_at: '2024-02-12T08:00:00Z' },
  { id: 'n2', user_id: 'u1', message: 'Emily Editor commented on User Authentication System', link: '/requirements', is_read: true, created_at: '2024-02-10T10:00:00Z' },
]
