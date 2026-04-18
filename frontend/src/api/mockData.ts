import type { Requirement, User, Tag, Comment, ActivityLog, DashboardMetrics, Notification, DashboardReqItem, Task, App } from '@/types'

function relWeek(weeksBack: number): string {
  const d = new Date()
  d.setDate(d.getDate() - weeksBack * 7)
  return d.toISOString().split('T')[0]
}

function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString()
}

export const mockUsers: User[] = [
  { id: 'u1', email: 'admin@brm.app',  full_name: 'Alex Admin',    role: 'admin',  avatar_url: '', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'u2', email: 'editor@brm.app', full_name: 'Emily Editor',  role: 'editor', avatar_url: '', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'u3', email: 'viewer@brm.app', full_name: 'Victor Viewer', role: 'viewer', avatar_url: '', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
]

export const mockTags: Tag[] = [
  { id: 't1', name: 'Enterprise',   color: '#6366F1' },
  { id: 't2', name: 'Wholesale',    color: '#10B981' },
  { id: 't3', name: 'Consumer',     color: '#F59E0B' },
  { id: 't4', name: 'Connectivity', color: '#3B82F6' },
  { id: 't5', name: 'Digital',      color: '#EC4899' },
]

export const mockComments: Comment[] = [
  { id: 'c1', requirement_id: 'r1', author_id: 'u2', author: mockUsers[1], body: 'This needs to support OAuth2 as well.', created_at: '2024-02-10T10:00:00Z', updated_at: '2024-02-10T10:00:00Z' },
  { id: 'c2', requirement_id: 'r1', author_id: 'u1', author: mockUsers[0], body: 'Agreed, adding that to the scope.', created_at: '2024-02-11T09:00:00Z', updated_at: '2024-02-11T09:00:00Z' },
  { id: 'c3', requirement_id: 'r9', author_id: 'u1', author: mockUsers[0], body: 'Payment gateway integration is blocked on vendor approval.', created_at: '2024-03-01T09:00:00Z', updated_at: '2024-03-01T09:00:00Z' },
  { id: 'c4', requirement_id: 'r9', author_id: 'u2', author: mockUsers[1], body: 'Targeting Stripe + GCash for the first release.', created_at: '2024-03-02T14:00:00Z', updated_at: '2024-03-02T14:00:00Z' },
]

export const mockActivity: ActivityLog[] = [
  { id: 'a1', requirement_id: 'r1',  actor_id: 'u1', actor: mockUsers[0], action: 'status_changed', meta: '{"from":"uat","to":"completed"}',    created_at: '2024-02-12T08:00:00Z' },
  { id: 'a2', requirement_id: 'r1',  actor_id: 'u2', actor: mockUsers[1], action: 'comment_added',  meta: '{}',                                 created_at: '2024-02-10T10:00:00Z' },
  { id: 'a3', requirement_id: 'r2',  actor_id: 'u1', actor: mockUsers[0], action: 'created',        meta: '{}',                                 created_at: '2024-02-09T14:00:00Z' },
  { id: 'a4', requirement_id: 'r9',  actor_id: 'u2', actor: mockUsers[1], action: 'status_changed', meta: '{"from":"sit","to":"d2p"}',           created_at: '2024-03-05T10:00:00Z' },
  { id: 'a5', requirement_id: 'r15', actor_id: 'u1', actor: mockUsers[0], action: 'status_changed', meta: '{"from":"production_test","to":"completed"}', created_at: '2024-03-10T11:00:00Z' },
  { id: 'a6', requirement_id: 'r10', actor_id: 'u2', actor: mockUsers[1], action: 'assigned',       meta: '{}',                                 created_at: '2024-03-12T09:00:00Z' },
]

export const mockRequirements: Requirement[] = [
  // ── Completed ───────────────────────────────────────────────────────────────
  {
    id: 'r1', title: 'User Authentication System',
    description: 'Implement secure JWT-based authentication with refresh tokens, role-based access control, and password reset functionality.',
    status: 'completed', priority: 'critical',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    due_date: '2024-03-15T00:00:00Z', position: 0,
    tags: [mockTags[0], mockTags[3]], comments: mockComments.filter(c => c.requirement_id === 'r1'),
    created_at: '2024-01-15T00:00:00Z', updated_at: '2024-02-12T00:00:00Z',
  },
  {
    id: 'r15', title: 'Two-Factor Authentication',
    description: 'Add TOTP-based 2FA support via Google Authenticator and SMS backup codes for all user roles.',
    status: 'completed', priority: 'critical',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: '2024-03-10T00:00:00Z', position: 1,
    tags: [mockTags[0], mockTags[3]], comments: [],
    created_at: '2024-01-18T00:00:00Z', updated_at: '2024-03-10T00:00:00Z',
  },

  // ── Production Test ──────────────────────────────────────────────────────────
  {
    id: 'r8', title: 'Role Permission Audit Trail',
    description: 'Log all permission changes and sensitive actions to a separate audit log table with tamper-proof storage.',
    status: 'production_test', priority: 'high',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: daysFromNow(3), position: 3,
    tags: [mockTags[3]], comments: [],
    created_at: '2024-02-12T00:00:00Z', updated_at: '2024-02-12T00:00:00Z',
  },

  // ── D2P ────────────────────────────────────────────────────────────────────
  {
    id: 'r9', title: 'Billing & Subscription Module',
    description: 'Integrate payment gateways (Stripe, GCash) for monthly and annual subscription plans with automatic renewal and invoice generation.',
    status: 'd2p', priority: 'critical',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: daysFromNow(14), position: 5,
    tags: [mockTags[0], mockTags[2]], comments: mockComments.filter(c => c.requirement_id === 'r9'),
    created_at: '2024-02-15T00:00:00Z', updated_at: '2024-03-05T00:00:00Z',
  },

  // ── UAT ────────────────────────────────────────────────────────────────────
  {
    id: 'r6', title: 'Performance Optimization Review',
    description: 'Review and optimize database queries, add proper indexes, implement query caching with Redis, and reduce API p95 latency below 200ms.',
    status: 'uat', priority: 'medium',
    created_by_id: 'u3', created_by: mockUsers[2],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: daysFromNow(6), position: 7,
    tags: [mockTags[4]], comments: [],
    created_at: '2024-02-08T00:00:00Z', updated_at: '2024-02-08T00:00:00Z',
  },
  {
    id: 'r12', title: 'Data Backup & Recovery',
    description: 'Automated daily PostgreSQL backups to S3, point-in-time recovery support, and documented disaster-recovery runbook.',
    status: 'uat', priority: 'critical',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    due_date: daysFromNow(8), position: 8,
    tags: [mockTags[3]], comments: [],
    created_at: '2024-02-18T00:00:00Z', updated_at: '2024-03-01T00:00:00Z',
  },

  // ── SIT ────────────────────────────────────────────────────────────────────
  {
    id: 'r5', title: 'Kanban Drag-and-Drop',
    description: 'Implement drag-and-drop using @dnd-kit. Persist position and status changes to backend in real time.',
    status: 'sit', priority: 'high',
    created_by_id: 'u2', created_by: mockUsers[1],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    due_date: '2024-03-30T00:00:00Z', position: 10,
    tags: [mockTags[0], mockTags[4]], comments: [],
    created_at: '2024-02-05T00:00:00Z', updated_at: '2024-02-05T00:00:00Z',
  },
  {
    id: 'r11', title: 'Advanced Search & Filtering',
    description: 'Full-text search across requirements, multi-field filter combinations, saved filter presets, and deep-linkable filter state via URL params.',
    status: 'sit', priority: 'medium',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    position: 11, tags: [mockTags[1]],
    comments: [],
    created_at: '2024-02-22T00:00:00Z', updated_at: '2024-03-05T00:00:00Z',
  },

  // ── Development ─────────────────────────────────────────────────────────────
  {
    id: 'r2', title: 'Dashboard Analytics Integration',
    description: 'Integrate recharts for displaying real-time business metrics including requirement counts, status distribution, and team performance.',
    status: 'development', priority: 'high',
    created_by_id: 'u2', created_by: mockUsers[1],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: '2024-04-01T00:00:00Z', position: 13,
    tags: [mockTags[0]], comments: [],
    created_at: '2024-01-20T00:00:00Z', updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'r10', title: 'Real-time Notifications (WebSocket)',
    description: 'Push live requirement updates, comments, and assignment changes to connected clients via WebSocket using Gin and gorilla/websocket.',
    status: 'development', priority: 'high',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    due_date: daysFromNow(-5), position: 14,
    tags: [mockTags[3], mockTags[4]], comments: [],
    created_at: '2024-02-28T00:00:00Z', updated_at: '2024-03-12T00:00:00Z',
  },

  // ── Requirement Gathering ───────────────────────────────────────────────────
  {
    id: 'r3', title: 'Export to CSV/PDF Feature',
    description: 'Allow users to export requirements list to CSV and PDF formats with applied filters preserved.',
    status: 'requirement_gathering', priority: 'medium',
    created_by_id: 'u2', created_by: mockUsers[1],
    position: 16, tags: [mockTags[1]], comments: [],
    created_at: '2024-02-01T00:00:00Z', updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'r13', title: 'API Rate Limiting',
    description: 'Implement per-user and per-IP rate limiting on all public API endpoints using a Redis token-bucket algorithm.',
    status: 'requirement_gathering', priority: 'high',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    position: 17, tags: [mockTags[3]],
    comments: [],
    created_at: '2024-03-08T00:00:00Z', updated_at: '2024-03-08T00:00:00Z',
  },

  // ── To Do ───────────────────────────────────────────────────────────────────
  {
    id: 'r4', title: 'Email Notification System',
    description: 'Send email notifications when requirement status changes, new comments are added, or assignments change. Support digest mode.',
    status: 'todo', priority: 'medium',
    created_by_id: 'u1', created_by: mockUsers[0],
    position: 19, tags: [mockTags[1], mockTags[2]], comments: [],
    created_at: '2024-02-03T00:00:00Z', updated_at: '2024-02-03T00:00:00Z',
  },
  {
    id: 'r7', title: 'Multi-language Support (i18n)',
    description: 'Add internationalization support for English, Spanish, and Filipino using react-i18next with lazy-loaded locale bundles.',
    status: 'todo', priority: 'low',
    created_by_id: 'u1', created_by: mockUsers[0],
    position: 20, tags: [mockTags[0]], comments: [],
    created_at: '2024-02-10T00:00:00Z', updated_at: '2024-02-10T00:00:00Z',
  },
  {
    id: 'r14', title: 'Customer Onboarding Flow',
    description: 'Guided multi-step onboarding wizard for new customers: org setup, user invitations, first requirement creation, and tutorial tooltips.',
    status: 'todo', priority: 'medium',
    created_by_id: 'u2', created_by: mockUsers[1],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    position: 21, tags: [mockTags[2], mockTags[4]],
    comments: [],
    created_at: '2024-03-12T00:00:00Z', updated_at: '2024-03-12T00:00:00Z',
  },
]

// ─── Apps ────────────────────────────────────────────────────────────────────

export const mockApps: App[] = [
  { id: 'app1', name: 'SCOne',      description: 'Supply Chain One',                          created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'app2', name: 'NCX EBIS',   description: 'NCX Enterprise Business Intelligence System', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'app3', name: 'NCX Retail', description: 'NCX Retail platform',                       created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'app4', name: 'EAI',        description: 'Enterprise Application Integration',        created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'app5', name: 'OSM',        description: 'Order and Service Management',              created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
]

// ─── Tasks (keyed by requirement_id) ─────────────────────────────────────────

export const mockTasks: Record<string, Task[]> = {
  r1: [
    { id: 'k1', requirement_id: 'r1', app_id: 'app2', title: 'Design JWT token schema',             description: 'Define access + refresh token payload and expiry strategy.', status: 'done',        start_date: '2024-01-16T00:00:00Z', target_date: '2024-01-20T00:00:00Z', created_at: '2024-01-16T00:00:00Z', updated_at: '2024-01-20T00:00:00Z' },
    { id: 'k2', requirement_id: 'r1', app_id: 'app2', title: 'Implement login & refresh endpoints',  description: '',                                                          status: 'done',        start_date: '2024-01-21T00:00:00Z', target_date: '2024-02-01T00:00:00Z', created_at: '2024-01-21T00:00:00Z', updated_at: '2024-02-01T00:00:00Z' },
    { id: 'k3', requirement_id: 'r1', app_id: 'app2', title: 'Add RBAC middleware',                  description: 'Guard routes by role: admin, editor, viewer.',              status: 'done',        start_date: '2024-02-01T00:00:00Z', target_date: '2024-02-10T00:00:00Z', created_at: '2024-02-01T00:00:00Z', updated_at: '2024-02-10T00:00:00Z' },
    { id: 'k4', requirement_id: 'r1', app_id: 'app2', title: 'Password reset flow',                  description: 'Email link with signed token, 15-min expiry.',              status: 'done',        start_date: '2024-02-05T00:00:00Z', target_date: '2024-02-12T00:00:00Z', created_at: '2024-02-05T00:00:00Z', updated_at: '2024-02-12T00:00:00Z' },
  ],
  r2: [
    { id: 'k5', requirement_id: 'r2', app_id: 'app2', title: 'Set up recharts library',              description: '',                                                          status: 'done',        start_date: '2024-01-22T00:00:00Z', target_date: '2024-01-25T00:00:00Z', created_at: '2024-01-22T00:00:00Z', updated_at: '2024-01-25T00:00:00Z' },
    { id: 'k6', requirement_id: 'r2', app_id: 'app2', title: 'Build status distribution bar chart',  description: '',                                                          status: 'done',        start_date: '2024-01-26T00:00:00Z', target_date: '2024-02-01T00:00:00Z', created_at: '2024-01-26T00:00:00Z', updated_at: '2024-02-01T00:00:00Z' },
    { id: 'k7', requirement_id: 'r2', app_id: 'app2', title: 'Build priority pie chart',             description: '',                                                          status: 'in_progress', start_date: '2024-02-02T00:00:00Z', target_date: '2024-02-15T00:00:00Z', created_at: '2024-02-02T00:00:00Z', updated_at: '2024-02-10T00:00:00Z' },
    { id: 'k8', requirement_id: 'r2', app_id: 'app2', title: 'Add filter bar to dashboard',          description: 'Date range, status, priority, tags.',                      status: 'in_progress', start_date: '2024-02-05T00:00:00Z', target_date: '2024-02-20T00:00:00Z', created_at: '2024-02-05T00:00:00Z', updated_at: '2024-02-10T00:00:00Z' },
    { id: 'k9', requirement_id: 'r2', app_id: 'app2', title: 'Throughput area chart',                description: 'Weekly completions over last 8 weeks.',                    status: 'todo',        start_date: '2024-02-18T00:00:00Z', target_date: '2024-02-28T00:00:00Z', created_at: '2024-02-08T00:00:00Z', updated_at: '2024-02-08T00:00:00Z' },
  ],
  r5: [
    { id: 'k10', requirement_id: 'r5', app_id: 'app2', title: 'Integrate @dnd-kit',                 description: 'Set up DndContext and SortableContext per column.',          status: 'done',        start_date: '2024-02-06T00:00:00Z', target_date: '2024-02-10T00:00:00Z', created_at: '2024-02-06T00:00:00Z', updated_at: '2024-02-10T00:00:00Z' },
    { id: 'k11', requirement_id: 'r5', app_id: 'app2', title: 'Persist drag-reorder to backend',    description: 'PATCH /requirements/reorder on drop.',                      status: 'done',        start_date: '2024-02-10T00:00:00Z', target_date: '2024-02-14T00:00:00Z', created_at: '2024-02-10T00:00:00Z', updated_at: '2024-02-14T00:00:00Z' },
    { id: 'k12', requirement_id: 'r5', app_id: 'app2', title: 'Drop animation polish',              description: 'Spring easing, overlay card, column glow on hover.',        status: 'in_progress', start_date: '2024-02-14T00:00:00Z', target_date: '2024-02-22T00:00:00Z', created_at: '2024-02-14T00:00:00Z', updated_at: '2024-02-18T00:00:00Z' },
    { id: 'k13', requirement_id: 'r5', app_id: 'app2', title: 'Empty column droppable zone',        description: '',                                                          status: 'todo',        start_date: '2024-02-20T00:00:00Z', target_date: '2024-02-25T00:00:00Z', created_at: '2024-02-15T00:00:00Z', updated_at: '2024-02-15T00:00:00Z' },
  ],
  r8: [
    { id: 'k14', requirement_id: 'r8', app_id: 'app4', title: 'Design audit_logs table',            description: 'actor, action, target_type, target_id, diff JSON.',        status: 'done',        start_date: '2024-02-13T00:00:00Z', target_date: '2024-02-15T00:00:00Z', created_at: '2024-02-13T00:00:00Z', updated_at: '2024-02-15T00:00:00Z' },
    { id: 'k15', requirement_id: 'r8', app_id: 'app4', title: 'Hook into GORM callbacks',           description: 'BeforeUpdate / BeforeDelete to write audit entries.',       status: 'done',        start_date: '2024-02-15T00:00:00Z', target_date: '2024-02-20T00:00:00Z', created_at: '2024-02-15T00:00:00Z', updated_at: '2024-02-20T00:00:00Z' },
    { id: 'k16', requirement_id: 'r8', app_id: 'app4', title: 'Audit log API endpoint',             description: 'GET /audit-logs with filters.',                             status: 'in_progress', start_date: '2024-02-20T00:00:00Z', target_date: '2024-02-28T00:00:00Z', created_at: '2024-02-20T00:00:00Z', updated_at: '2024-02-25T00:00:00Z' },
    { id: 'k17', requirement_id: 'r8', app_id: 'app4', title: 'Frontend audit log viewer',          description: 'Table with diff expansion.',                                status: 'todo',        start_date: '2024-02-26T00:00:00Z', target_date: '2024-03-05T00:00:00Z', created_at: '2024-02-22T00:00:00Z', updated_at: '2024-02-22T00:00:00Z' },
  ],
  r9: [
    { id: 'k18', requirement_id: 'r9', app_id: 'app3', title: 'Stripe subscription setup',          description: 'Products, prices, and webhook handler.',                    status: 'done',        start_date: '2024-02-16T00:00:00Z', target_date: '2024-02-25T00:00:00Z', created_at: '2024-02-16T00:00:00Z', updated_at: '2024-02-25T00:00:00Z' },
    { id: 'k19', requirement_id: 'r9', app_id: 'app3', title: 'GCash payment integration',          description: 'Maya/GCash checkout via payment link API.',                 status: 'in_progress', start_date: '2024-02-26T00:00:00Z', target_date: '2024-03-10T00:00:00Z', created_at: '2024-02-26T00:00:00Z', updated_at: '2024-03-05T00:00:00Z' },
    { id: 'k20', requirement_id: 'r9', app_id: 'app3', title: 'Invoice PDF generation',             description: 'Auto-generate invoice on successful payment.',               status: 'todo',        start_date: '2024-03-08T00:00:00Z', target_date: '2024-03-18T00:00:00Z', created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' },
    { id: 'k21', requirement_id: 'r9', app_id: 'app3', title: 'Subscription management UI',         description: 'Upgrade, downgrade, cancel, and billing history.',          status: 'todo',        start_date: '2024-03-15T00:00:00Z', target_date: '2024-03-25T00:00:00Z', created_at: '2024-03-02T00:00:00Z', updated_at: '2024-03-02T00:00:00Z' },
  ],
  r10: [
    { id: 'k22', requirement_id: 'r10', app_id: 'app1', title: 'WebSocket hub in Go',               description: 'gorilla/websocket Hub with register/unregister/broadcast.', status: 'done',        start_date: '2024-03-01T00:00:00Z', target_date: '2024-03-05T00:00:00Z', created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-05T00:00:00Z' },
    { id: 'k23', requirement_id: 'r10', app_id: 'app1', title: 'Broadcast on requirement change',   description: 'Emit events from handlers after DB writes.',                status: 'in_progress', start_date: '2024-03-06T00:00:00Z', target_date: '2024-03-14T00:00:00Z', created_at: '2024-03-06T00:00:00Z', updated_at: '2024-03-12T00:00:00Z' },
    { id: 'k24', requirement_id: 'r10', app_id: 'app1', title: 'Frontend WS client hook',           description: 'useWebSocket hook that reconnects on drop.',                status: 'todo',        start_date: '2024-03-12T00:00:00Z', target_date: '2024-03-20T00:00:00Z', created_at: '2024-03-08T00:00:00Z', updated_at: '2024-03-08T00:00:00Z' },
    { id: 'k25', requirement_id: 'r10', app_id: 'app1', title: 'Toast on incoming events',          description: 'Show toast when another user updates a requirement.',       status: 'todo',        start_date: '2024-03-18T00:00:00Z', target_date: '2024-03-25T00:00:00Z', created_at: '2024-03-09T00:00:00Z', updated_at: '2024-03-09T00:00:00Z' },
  ],
  r15: [
    { id: 'k26', requirement_id: 'r15', app_id: 'app5', title: 'TOTP secret generation',            description: 'Generate and store encrypted TOTP secrets per user.',       status: 'done',        start_date: '2024-01-19T00:00:00Z', target_date: '2024-01-25T00:00:00Z', created_at: '2024-01-19T00:00:00Z', updated_at: '2024-01-25T00:00:00Z' },
    { id: 'k27', requirement_id: 'r15', app_id: 'app5', title: 'QR code enrollment screen',         description: 'Display QR code for authenticator app setup.',              status: 'done',        start_date: '2024-01-26T00:00:00Z', target_date: '2024-02-02T00:00:00Z', created_at: '2024-01-26T00:00:00Z', updated_at: '2024-02-02T00:00:00Z' },
    { id: 'k28', requirement_id: 'r15', app_id: 'app5', title: 'Backup SMS codes',                  description: '8-digit one-time backup codes on enrollment.',              status: 'done',        start_date: '2024-02-03T00:00:00Z', target_date: '2024-02-10T00:00:00Z', created_at: '2024-02-03T00:00:00Z', updated_at: '2024-02-10T00:00:00Z' },
    { id: 'k29', requirement_id: 'r15', app_id: 'app5', title: 'Login TOTP verification step',      description: 'Second-factor challenge after password check.',             status: 'done',        start_date: '2024-02-10T00:00:00Z', target_date: '2024-03-10T00:00:00Z', created_at: '2024-02-10T00:00:00Z', updated_at: '2024-03-10T00:00:00Z' },
  ],
}

// ─── Dashboard supporting data ────────────────────────────────────────────────

const mockOverdueList: DashboardReqItem[] = [
  { id: 'r10', title: 'Real-time Notifications (WebSocket)', priority: 'high', status: 'development', due_date: daysFromNow(-5), assigned_to: mockUsers[1] },
  { id: 'r2',  title: 'Dashboard Analytics Integration',     priority: 'high', status: 'development', due_date: '2024-04-01T00:00:00Z', assigned_to: mockUsers[0] },
  { id: 'r5',  title: 'Kanban Drag-and-Drop',                priority: 'high', status: 'sit',         due_date: '2024-03-30T00:00:00Z', assigned_to: mockUsers[1] },
]

const mockUpcomingList: DashboardReqItem[] = [
  { id: 'r8',  title: 'Role Permission Audit Trail',     priority: 'high',     status: 'production_test', due_date: daysFromNow(3), assigned_to: mockUsers[0] },
  { id: 'r6',  title: 'Performance Optimization Review', priority: 'medium',   status: 'uat',             due_date: daysFromNow(6) },
  { id: 'r12', title: 'Data Backup & Recovery',          priority: 'critical', status: 'uat',             due_date: daysFromNow(8), assigned_to: mockUsers[1] },
]

export const mockMetrics: DashboardMetrics = {
  total:         mockRequirements.length,
  approved:      mockRequirements.filter(r => r.status === 'completed').length,
  in_review:     mockRequirements.filter(r => ['development', 'sit', 'uat'].includes(r.status)).length,
  critical_open: mockRequirements.filter(r => r.priority === 'critical' && r.status !== 'completed').length,
  overdue:       mockOverdueList.length,
  due_this_week: mockUpcomingList.length,
  open_tasks:    Object.values(mockTasks).flat().filter(t => t.status !== 'done').length,
  by_status: ['todo', 'requirement_gathering', 'development', 'sit', 'uat', 'd2p', 'production_test', 'completed'].map((s) => ({
    status: s as any,
    count:  mockRequirements.filter(r => r.status === s).length,
  })),
  by_priority: ['critical', 'high', 'medium', 'low'].map((p) => ({
    priority: p as any,
    count:    mockRequirements.filter(r => r.priority === p).length,
  })),
  by_tag: mockTags.map((t) => ({
    tag_id:   t.id,
    tag_name: t.name,
    color:    t.color,
    count:    mockRequirements.filter(r => r.tags?.some(rt => rt.id === t.id)).length,
  })).sort((a, b) => b.count - a.count),
  by_assignee: [
    { user_id: 'u1', full_name: 'Alex Admin',   count: mockRequirements.filter(r => r.assigned_to_id === 'u1' && r.status !== 'completed').length },
    { user_id: 'u2', full_name: 'Emily Editor', count: mockRequirements.filter(r => r.assigned_to_id === 'u2' && r.status !== 'completed').length },
  ],
  throughput: [
    { week: relWeek(7), count: 1 },
    { week: relWeek(6), count: 3 },
    { week: relWeek(5), count: 2 },
    { week: relWeek(4), count: 5 },
    { week: relWeek(3), count: 3 },
    { week: relWeek(2), count: 4 },
    { week: relWeek(1), count: 6 },
    { week: relWeek(0), count: 2 },
  ],
  overdue_list:  mockOverdueList,
  upcoming_list: mockUpcomingList,
  recent_activity: [
    { ...mockActivity[3], requirement_title: 'Billing & Subscription Module' },
    { ...mockActivity[4], requirement_title: 'Two-Factor Authentication' },
    { ...mockActivity[5], requirement_title: 'Real-time Notifications (WebSocket)' },
    { ...mockActivity[0], requirement_title: 'User Authentication System' },
    { ...mockActivity[1], requirement_title: 'User Authentication System' },
  ],
}

export const mockNotifications: Notification[] = [
  { id: 'n1', user_id: 'u1', message: 'Billing & Subscription Module moved to D2P', link: '/requirements', is_read: false, created_at: '2024-03-05T10:00:00Z' },
  { id: 'n2', user_id: 'u1', message: 'Two-Factor Authentication marked as completed', link: '/requirements', is_read: false, created_at: '2024-03-10T11:00:00Z' },
  { id: 'n3', user_id: 'u1', message: 'Emily Editor commented on Billing & Subscription Module', link: '/requirements', is_read: true, created_at: '2024-03-02T14:00:00Z' },
]
