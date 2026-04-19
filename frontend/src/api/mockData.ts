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
  { id: 'u1', email: 'renzo@ibp.app',   full_name: 'Renzo Alvaroshan', role: 'admin',  avatar_url: '', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'u2', email: 'bagus@ibp.app',   full_name: 'Bagus Laksono',    role: 'editor', avatar_url: '', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'u3', email: 'sari@ibp.app',    full_name: 'Sari Pratiwi',     role: 'editor', avatar_url: '', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'u4', email: 'rona@ibp.app',    full_name: 'Rona Anindita',    role: 'editor', avatar_url: '', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'u5', email: 'gama@ibp.app',    full_name: 'Gama Wirawan',     role: 'viewer', avatar_url: '', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
]

export const mockTags: Tag[] = [
  { id: 't1', name: 'Enterprise',   color: '#6366F1' },
  { id: 't2', name: 'Wholesale',    color: '#10B981' },
  { id: 't3', name: 'Consumer',     color: '#F59E0B' },
  { id: 't4', name: 'Connectivity', color: '#3B82F6' },
  { id: 't5', name: 'Digital',      color: '#EC4899' },
]

export const mockComments: Comment[] = [
  { id: 'c1', requirement_id: 'r1', author_id: 'u2', author: mockUsers[1], body: 'Progress ownership transfer EMRM ke CEM sudah 60%, menunggu approval final dari IPA.', created_at: '2026-03-20T10:00:00Z', updated_at: '2026-03-20T10:00:00Z' },
  { id: 'c2', requirement_id: 'r1', author_id: 'u1', author: mockUsers[0], body: 'Noted. Mohon pastikan dokumentasi BAST lengkap sebelum hand-off.',                      created_at: '2026-03-21T09:00:00Z', updated_at: '2026-03-21T09:00:00Z' },
  { id: 'c3', requirement_id: 'r3', author_id: 'u1', author: mockUsers[0], body: 'Backlog Sales Funnel prioritas tinggi — target completion sebelum Q2.',                 created_at: '2026-03-25T09:00:00Z', updated_at: '2026-03-25T09:00:00Z' },
  { id: 'c4', requirement_id: 'r3', author_id: 'u4', author: mockUsers[3], body: 'Rona & Gama handle backlog 01 & 02, sisanya dibagi ke tim Andien.',                      created_at: '2026-03-26T14:00:00Z', updated_at: '2026-03-26T14:00:00Z' },
  { id: 'c5', requirement_id: 'r12', author_id: 'u2', author: mockUsers[1], body: 'Dev Multi SST MO Del selesai, menunggu schedule deployment D2P minggu depan.',         created_at: '2026-04-10T11:00:00Z', updated_at: '2026-04-10T11:00:00Z' },
  { id: 'c6', requirement_id: 'r2',  author_id: 'u1', author: mockUsers[0], body: 'Sudah koordinasi dengan Pak Yudhi, target FDR siap minggu ini.',                      created_at: '2026-04-12T08:30:00Z', updated_at: '2026-04-12T08:30:00Z' },
  { id: 'c7', requirement_id: 'r9',  author_id: 'u1', author: mockUsers[0], body: 'Transfer akses security group tinggal sign-off dari BSS, dokumentasi sedang disiapkan.', created_at: '2026-04-10T13:00:00Z', updated_at: '2026-04-10T13:00:00Z' },
  { id: 'c8', requirement_id: 'r14', author_id: 'u2', author: mockUsers[1], body: 'UAT MODOROSO jalan paralel dengan D2P AO, target beres akhir bulan.',                 created_at: '2026-04-08T15:30:00Z', updated_at: '2026-04-08T15:30:00Z' },
  { id: 'c9', requirement_id: 'r19', author_id: 'u4', author: mockUsers[3], body: 'Animasi drop sudah enak, tinggal polish overlay card di mobile breakpoint.',           created_at: '2026-04-10T09:00:00Z', updated_at: '2026-04-10T09:00:00Z' },
]

export const mockActivity: ActivityLog[] = [
  { id: 'a1', requirement_id: 'r1',  actor_id: 'u1', actor: mockUsers[0], action: 'status_changed', meta: '{"from":"requirement_gathering","to":"development"}', created_at: '2026-03-15T08:00:00Z' },
  { id: 'a2', requirement_id: 'r1',  actor_id: 'u2', actor: mockUsers[1], action: 'comment_added',  meta: '{}',                                                   created_at: '2026-03-20T10:00:00Z' },
  { id: 'a3', requirement_id: 'r3',  actor_id: 'u1', actor: mockUsers[0], action: 'created',        meta: '{}',                                                   created_at: '2026-03-05T14:00:00Z' },
  { id: 'a4', requirement_id: 'r12', actor_id: 'u2', actor: mockUsers[1], action: 'status_changed', meta: '{"from":"sit","to":"d2p"}',                             created_at: '2026-04-08T10:00:00Z' },
  { id: 'a5', requirement_id: 'r16', actor_id: 'u1', actor: mockUsers[0], action: 'status_changed', meta: '{"from":"production_test","to":"completed"}',           created_at: '2026-04-01T11:00:00Z' },
  { id: 'a6', requirement_id: 'r14', actor_id: 'u2', actor: mockUsers[1], action: 'assigned',       meta: '{}',                                                   created_at: '2026-04-02T09:00:00Z' },
]

// Today ~ 2026-04-19. Dates are expressed relative so demo always looks fresh.
export const mockRequirements: Requirement[] = [
  // ── Completed ──────────────────────────────────────────────────────────────
  {
    id: 'r16', title: 'Integrasi API MyIndiHome ke Digital Business Assurance',
    description: 'Integrasi endpoint billing dan provisioning MyIndiHome dengan platform Digital Business Assurance untuk memperkuat monitoring revenue leakage.',
    status: 'completed', priority: 'critical',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    due_date: '2026-03-30T00:00:00Z', position: 0,
    tags: [mockTags[3], mockTags[4]], comments: [],
    created_at: '2026-01-20T00:00:00Z', updated_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'r17', title: 'Penyesuaian Bispro Billing Wholesale Segment',
    description: 'Penyesuaian business process billing pada segmen Wholesale untuk mendukung skema tiered pricing multi-produk dan invoice konsolidasi.',
    status: 'completed', priority: 'high',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u3', assigned_to: mockUsers[2],
    due_date: '2026-03-25T00:00:00Z', position: 1,
    tags: [mockTags[1]], comments: [],
    created_at: '2026-01-28T00:00:00Z', updated_at: '2026-03-25T00:00:00Z',
  },

  // ── Production Test (8IC equivalent) ───────────────────────────────────────
  {
    id: 'r11', title: 'WMS Lite Low Bandwidth',
    description: 'Optimasi WMS Lite agar tetap reliable pada jaringan bandwidth rendah di wilayah rural. Termasuk offline queue dan kompresi payload.',
    status: 'production_test', priority: 'high',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    due_date: '2026-04-10T00:00:00Z', position: 2,
    tags: [mockTags[3]], comments: [],
    created_at: '2026-02-05T00:00:00Z', updated_at: '2026-04-05T00:00:00Z',
  },
  {
    id: 'r18', title: 'Role Permission Audit Trail',
    description: 'Pencatatan seluruh perubahan role dan akses sensitif ke audit log table dengan tamper-proof storage untuk kepentingan compliance internal.',
    status: 'production_test', priority: 'high',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: daysFromNow(3), position: 3,
    tags: [mockTags[0]], comments: [],
    created_at: '2026-02-12T00:00:00Z', updated_at: '2026-04-05T00:00:00Z',
  },

  // ── D2P ────────────────────────────────────────────────────────────────────
  {
    id: 'r12', title: 'Multi SST MO Del & Penyesuaian Surrounding LENSA/MyTech',
    description: 'Penambahan Multi SST untuk MO Delete beserta penyesuaian aplikasi surrounding: LENSA, MyTech, UT Online, dan format BAI.',
    status: 'd2p', priority: 'critical',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u3', assigned_to: mockUsers[2],
    due_date: daysFromNow(14), position: 4,
    tags: [mockTags[0], mockTags[3]], comments: mockComments.filter(c => c.requirement_id === 'r12'),
    created_at: '2026-02-15T00:00:00Z', updated_at: '2026-04-10T00:00:00Z',
  },

  // ── UAT ────────────────────────────────────────────────────────────────────
  {
    id: 'r13', title: 'Autonomous Network for Metro',
    description: 'Deployment fitur Autonomous Network pada segmen Metro melalui OSS. Auto-healing, auto-provisioning, dan predictive maintenance.',
    status: 'uat', priority: 'high',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    due_date: daysFromNow(10), position: 5,
    tags: [mockTags[3]], comments: [],
    created_at: '2026-02-08T00:00:00Z', updated_at: '2026-04-02T00:00:00Z',
  },
  {
    id: 'r14', title: 'Autonomous Network for WiFi',
    description: 'Integrasi Autonomous Network ke layanan WiFi (MyWifi). Termasuk D2P API NOMS untuk AO dan UAT API NOMS untuk MODOROSO.',
    status: 'uat', priority: 'high',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    due_date: daysFromNow(13), position: 6,
    tags: [mockTags[3], mockTags[4]], comments: mockComments.filter(c => c.requirement_id === 'r14'),
    created_at: '2026-02-18T00:00:00Z', updated_at: '2026-04-02T00:00:00Z',
  },
  {
    id: 'r15', title: 'Update Bispro WMS Hotel',
    description: 'Update business process WMS untuk segmen Hotel. Mencakup CDR aggregation ke Billing dan integrasi dengan PIC Neta.',
    status: 'uat', priority: 'medium',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    due_date: '2026-04-10T00:00:00Z', position: 7,
    tags: [mockTags[1]], comments: [],
    created_at: '2026-02-22T00:00:00Z', updated_at: '2026-04-05T00:00:00Z',
  },

  // ── SIT ────────────────────────────────────────────────────────────────────
  {
    id: 'r19', title: 'Kanban Drag-and-Drop untuk BRM',
    description: 'Implementasi drag-and-drop pada board requirements BRM menggunakan @dnd-kit. Persist posisi & status ke backend secara real-time.',
    status: 'sit', priority: 'high',
    created_by_id: 'u2', created_by: mockUsers[1],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    due_date: '2026-04-30T00:00:00Z', position: 8,
    tags: [mockTags[0], mockTags[4]], comments: mockComments.filter(c => c.requirement_id === 'r19'),
    created_at: '2026-02-05T00:00:00Z', updated_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'r20', title: 'Advanced Search & Filtering Requirements',
    description: 'Full-text search lintas requirements & tasks, kombinasi filter multi-field, saved presets, dan deep-linkable state via URL.',
    status: 'sit', priority: 'medium',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: daysFromNow(17), position: 9, tags: [mockTags[1]],
    comments: [],
    created_at: '2026-02-22T00:00:00Z', updated_at: '2026-03-28T00:00:00Z',
  },

  // ── Development (Handover — Alih Kelola items) ────────────────────────────
  {
    id: 'r1', title: 'Alih Kelola Telkom Solution',
    description: 'Hand-over pengelolaan aplikasi Telkom Solution dari EMRM ke CEM. Termasuk migrasi ke DIT dan diskusi lanjutan dengan IPA.',
    status: 'development', priority: 'high',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: daysFromNow(21), position: 10,
    tags: [mockTags[0], mockTags[3]], comments: mockComments.filter(c => c.requirement_id === 'r1'),
    created_at: '2026-03-01T00:00:00Z', updated_at: '2026-04-10T00:00:00Z',
  },
  {
    id: 'r2', title: 'Alih Kelola MyBrains',
    description: 'Migrasi MyBrains ke DIT (FDR) dan follow-up progress ke Pak Yudhi. Koordinasi stakeholder internal untuk smooth handover.',
    status: 'development', priority: 'high',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: daysFromNow(7), position: 11,
    tags: [mockTags[4]], comments: mockComments.filter(c => c.requirement_id === 'r2'),
    created_at: '2026-03-05T00:00:00Z', updated_at: '2026-04-12T00:00:00Z',
  },
  {
    id: 'r3', title: 'Alih Kelola EPIC, Andien & Raline ke MyTEnS GoBeyond',
    description: 'Migrasi tiga aplikasi (EPIC, Andien, Raline) ke platform MyTEnS GoBeyond. Backlog mencakup Sales Funnel, Billing Account, Transaction Validation, SBR Monitoring, dan sesi penjelasan ke BUD.',
    status: 'development', priority: 'critical',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: '2026-06-26T00:00:00Z', position: 12,
    tags: [mockTags[0], mockTags[1]], comments: mockComments.filter(c => c.requirement_id === 'r3'),
    created_at: '2026-02-28T00:00:00Z', updated_at: '2026-04-15T00:00:00Z',
  },
  {
    id: 'r4', title: 'Alih Kelola DigiReview BAST ke SMILE PMO',
    description: 'Pemindahan DigiReview BAST ke SMILE PMO. Termasuk user testing dan penyesuaian berdasarkan feedback user.',
    status: 'development', priority: 'medium',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: daysFromNow(28), position: 13,
    tags: [mockTags[4]], comments: [],
    created_at: '2026-03-10T00:00:00Z', updated_at: '2026-04-10T00:00:00Z',
  },
  {
    id: 'r5', title: 'Alih Kelola Brand360',
    description: 'Hand-over aplikasi Brand360 ke tim pengelola baru, dengan fokus pada dashboard visibility dan data governance.',
    status: 'development', priority: 'medium',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: daysFromNow(35), position: 14,
    tags: [mockTags[2], mockTags[4]], comments: [],
    created_at: '2026-03-12T00:00:00Z', updated_at: '2026-04-08T00:00:00Z',
  },
  {
    id: 'r6', title: 'Alih Kelola Aplikasi Inovasi TCU',
    description: 'Pengalihan pengelolaan aplikasi inovasi internal TCU. Scope kecil, prioritas standar, untuk memastikan continuity.',
    status: 'development', priority: 'low',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    due_date: daysFromNow(45), position: 15,
    tags: [mockTags[0]], comments: [],
    created_at: '2026-03-15T00:00:00Z', updated_at: '2026-03-20T00:00:00Z',
  },
  {
    id: 'r7', title: 'Alih Kelola DigiReview OBL-KL',
    description: 'Hand-over DigiReview untuk lini OBL-KL (Obligasi Konsumer Layanan). Termasuk review dokumen BAST dan sign-off.',
    status: 'development', priority: 'medium',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: daysFromNow(30), position: 16,
    tags: [mockTags[2]], comments: [],
    created_at: '2026-03-18T00:00:00Z', updated_at: '2026-04-05T00:00:00Z',
  },
  {
    id: 'r8', title: 'Alih Kelola MyJobs',
    description: 'Migrasi aplikasi MyJobs (internal HR tooling) ke pengelola baru, termasuk migrasi data dan user training.',
    status: 'development', priority: 'medium',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: daysFromNow(40), position: 17,
    tags: [mockTags[0]], comments: [],
    created_at: '2026-03-20T00:00:00Z', updated_at: '2026-04-03T00:00:00Z',
  },
  {
    id: 'r9', title: 'Alih Kelola ISM dari BSS ke CEM',
    description: 'Pemindahan pengelolaan Information Security Management dari tim BSS ke CEM. Termasuk transfer akses, dokumentasi policy, dan audit compliance.',
    status: 'development', priority: 'high',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: daysFromNow(42), position: 18,
    tags: [mockTags[0], mockTags[3]], comments: mockComments.filter(c => c.requirement_id === 'r9'),
    created_at: '2026-02-25T00:00:00Z', updated_at: '2026-04-10T00:00:00Z',
  },
  {
    id: 'r10', title: 'Alih Kelola Smart Capex (Terminate)',
    description: 'Proses terminate pengelolaan Smart Capex, termasuk decommissioning server, arsip data, dan penutupan akses.',
    status: 'development', priority: 'low',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    due_date: daysFromNow(60), position: 19,
    tags: [mockTags[0]], comments: [],
    created_at: '2026-03-25T00:00:00Z', updated_at: '2026-04-02T00:00:00Z',
  },

  // ── Requirement Gathering ──────────────────────────────────────────────────
  {
    id: 'r21', title: 'Export Laporan Requirements ke CSV/PDF',
    description: 'Mendukung export daftar requirements ke CSV dan PDF dengan filter tetap terpasang. Template PDF branded Telkom.',
    status: 'requirement_gathering', priority: 'medium',
    created_by_id: 'u2', created_by: mockUsers[1],
    position: 20, tags: [mockTags[1]], comments: [],
    created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'r22', title: 'API Rate Limiting untuk Public Endpoint',
    description: 'Implementasi rate limiting per-user dan per-IP pada endpoint public menggunakan Redis token bucket. Alert on abuse.',
    status: 'requirement_gathering', priority: 'high',
    created_by_id: 'u1', created_by: mockUsers[0],
    assigned_to_id: 'u1', assigned_to: mockUsers[0],
    position: 21, tags: [mockTags[3]],
    comments: [],
    created_at: '2026-04-08T00:00:00Z', updated_at: '2026-04-08T00:00:00Z',
  },

  // ── To Do ──────────────────────────────────────────────────────────────────
  {
    id: 'r23', title: 'Sistem Email Notification Status Change',
    description: 'Kirim notifikasi email saat status requirement berubah, comment baru ditambahkan, atau assignment berubah. Dukung mode digest harian.',
    status: 'todo', priority: 'medium',
    created_by_id: 'u1', created_by: mockUsers[0],
    position: 22, tags: [mockTags[1], mockTags[2]], comments: [],
    created_at: '2026-03-03T00:00:00Z', updated_at: '2026-03-03T00:00:00Z',
  },
  {
    id: 'r24', title: 'Multi-language Support (i18n) — ID/EN',
    description: 'Dukungan Bahasa Indonesia dan English untuk UI BRM menggunakan react-i18next. Locale bundle lazy-loaded.',
    status: 'todo', priority: 'low',
    created_by_id: 'u1', created_by: mockUsers[0],
    position: 23, tags: [mockTags[0]], comments: [],
    created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-10T00:00:00Z',
  },
  {
    id: 'r25', title: 'Customer Onboarding Flow BRM',
    description: 'Wizard onboarding multi-step untuk pengguna baru: org setup, user invitations, first requirement creation, dan tutorial tooltips.',
    status: 'todo', priority: 'medium',
    created_by_id: 'u2', created_by: mockUsers[1],
    assigned_to_id: 'u2', assigned_to: mockUsers[1],
    position: 24, tags: [mockTags[2], mockTags[4]],
    comments: [],
    created_at: '2026-03-12T00:00:00Z', updated_at: '2026-03-12T00:00:00Z',
  },
]

// ─── Apps ────────────────────────────────────────────────────────────────────

export const mockApps: App[] = [
  { id: 'app1', name: 'MyTEnS',      description: 'MyTEnS GoBeyond — platform enterprise Telkom',       created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'app2', name: 'SMILE PMO',   description: 'Platform PMO untuk DigiReview dan BAST',             created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'app3', name: 'NOMS',        description: 'Network Operation Management System',                created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'app4', name: 'OSS',         description: 'Operation Support System — core network ops',        created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'app5', name: 'WMS Lite',    description: 'Workforce Management System lite edition',           created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'app6', name: 'LENSA',       description: 'Aplikasi surrounding untuk MO Del/Amandemen',        created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'app7', name: 'DigiReview',  description: 'Digital review pipeline untuk BAST',                 created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
]

// ─── Tasks (keyed by requirement_id) ─────────────────────────────────────────

export const mockTasks: Record<string, Task[]> = {
  r1: [
    { id: 'k1',  requirement_id: 'r1', app_id: 'app7', title: 'Ownership Transfer EMRM ke CEM — Telkom Solution', description: 'Transfer ownership dokumen & sign-off dari EMRM ke CEM.', status: 'in_progress', start_date: '2026-03-05T00:00:00Z', target_date: '2026-04-25T00:00:00Z', created_at: '2026-03-05T00:00:00Z', updated_at: '2026-04-10T00:00:00Z' },
    { id: 'k2',  requirement_id: 'r1', app_id: 'app4', title: 'Migrasi Telkom Solution ke DIT',                   description: 'Rencana teknis migrasi ke DIT, termasuk checklist infra.',  status: 'todo',        start_date: '2026-04-20T00:00:00Z', target_date: '2026-05-05T00:00:00Z', created_at: '2026-03-05T00:00:00Z', updated_at: '2026-03-05T00:00:00Z' },
    { id: 'k3',  requirement_id: 'r1',                   title: 'Diskusi Lanjutan dengan EMRM & IPA',              description: 'Schedule follow-up meeting untuk sign-off final.',           status: 'todo',                                                                                       created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-10T00:00:00Z' },
  ],
  r2: [
    { id: 'k4',  requirement_id: 'r2', app_id: 'app4', title: 'Migrasi MyBrains ke DIT (FDR)',                    description: 'Eksekusi migrasi DB & konfigurasi FDR.',                   status: 'in_progress', start_date: '2026-03-20T00:00:00Z', target_date: '2026-04-22T00:00:00Z', created_at: '2026-03-20T00:00:00Z', updated_at: '2026-04-12T00:00:00Z' },
    { id: 'k5',  requirement_id: 'r2',                   title: 'Follow up progress ke Pak Yudhi',                 description: 'Reminder checkpoint mingguan dengan Pak Yudhi.',            status: 'todo',                                                                                        created_at: '2026-03-22T00:00:00Z', updated_at: '2026-03-22T00:00:00Z' },
  ],
  r3: [
    { id: 'k6',  requirement_id: 'r3', app_id: 'app1', title: 'Backlog 01 — Sales Funnel (Perpanjangan/Amandemen/MO)', description: 'Migrasi flow Sales Funnel untuk perpanjangan & amandemen MO.', status: 'in_progress', start_date: '2026-04-01T00:00:00Z', target_date: '2026-06-26T00:00:00Z', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-04-15T00:00:00Z' },
    { id: 'k7',  requirement_id: 'r3', app_id: 'app1', title: 'Backlog 02 — Sales Funnel (Project SO/DO/RO)',       description: 'Migrasi flow Sales Funnel untuk project SO/DO/RO.',           status: 'in_progress', start_date: '2026-04-01T00:00:00Z', target_date: '2026-06-26T00:00:00Z', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-04-15T00:00:00Z' },
    { id: 'k8',  requirement_id: 'r3', app_id: 'app1', title: 'Backlog 03 — Pengajuan Billing Account',            description: 'Migrasi modul pengajuan billing account.',                    status: 'in_progress', start_date: '2026-04-10T00:00:00Z', target_date: '2026-05-20T00:00:00Z', created_at: '2026-03-02T00:00:00Z', updated_at: '2026-04-10T00:00:00Z' },
    { id: 'k9',  requirement_id: 'r3', app_id: 'app1', title: 'Backlog 04 — Transaction Validation',               description: 'Validasi rule-set transaksi pada environment MyTEnS.',        status: 'in_progress', start_date: '2026-04-15T00:00:00Z', target_date: '2026-05-30T00:00:00Z', created_at: '2026-03-02T00:00:00Z', updated_at: '2026-04-12T00:00:00Z' },
    { id: 'k10', requirement_id: 'r3', app_id: 'app1', title: 'Backlog 05 — SBR Monitoring',                       description: 'Integrasi Service Business Rule monitoring ke MyTEnS.',       status: 'in_progress', start_date: '2026-04-18T00:00:00Z', target_date: '2026-06-10T00:00:00Z', created_at: '2026-03-05T00:00:00Z', updated_at: '2026-04-14T00:00:00Z' },
    { id: 'k11', requirement_id: 'r3', app_id: 'app1', title: 'Sesi Penjelasan Progres ke BUD — DPS & DSS',        description: 'Sesi penjelasan progres migrasi kepada BUD DPS & DSS.',       status: 'in_progress', start_date: '2026-04-10T00:00:00Z', target_date: '2026-04-14T00:00:00Z', created_at: '2026-03-05T00:00:00Z', updated_at: '2026-04-10T00:00:00Z' },
    { id: 'k12', requirement_id: 'r3', app_id: 'app1', title: 'Sesi Penjelasan Progres ke BUD — DGS',              description: 'Sesi penjelasan progres migrasi kepada BUD DGS.',             status: 'todo',        start_date: '2026-04-12T00:00:00Z', target_date: '2026-04-14T00:00:00Z', created_at: '2026-03-05T00:00:00Z', updated_at: '2026-03-05T00:00:00Z' },
  ],
  r4: [
    { id: 'k13', requirement_id: 'r4', app_id: 'app2', title: 'User testing SMILE PMO dan feedback',               description: 'Koordinasi user testing dengan tim PMO, kumpulkan feedback.', status: 'in_progress', start_date: '2026-04-05T00:00:00Z', target_date: '2026-04-25T00:00:00Z', created_at: '2026-03-10T00:00:00Z', updated_at: '2026-04-10T00:00:00Z' },
    { id: 'k14', requirement_id: 'r4', app_id: 'app2', title: 'Penyesuaian dari hasil feedback user',              description: 'Eksekusi perbaikan UI/UX berdasarkan feedback user testing.', status: 'todo',        start_date: '2026-04-26T00:00:00Z', target_date: '2026-05-15T00:00:00Z', created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-10T00:00:00Z' },
  ],
  r5: [
    { id: 'k15', requirement_id: 'r5',                   title: 'Mapping ownership Brand360',                      description: 'Identifikasi PIC baru dan mapping existing dashboard.',      status: 'in_progress', start_date: '2026-04-01T00:00:00Z', target_date: '2026-04-30T00:00:00Z', created_at: '2026-03-12T00:00:00Z', updated_at: '2026-04-08T00:00:00Z' },
  ],
  r6: [
    { id: 'k43', requirement_id: 'r6',                   title: 'Inventarisasi aplikasi inovasi TCU',              description: 'Kumpulkan list aplikasi inovasi TCU & PIC existing.',         status: 'todo',        start_date: '2026-04-20T00:00:00Z', target_date: '2026-05-10T00:00:00Z', created_at: '2026-03-15T00:00:00Z', updated_at: '2026-03-15T00:00:00Z' },
  ],
  r7: [
    { id: 'k16', requirement_id: 'r7', app_id: 'app7', title: 'Review dokumen BAST DigiReview OBL-KL',             description: 'Review lengkap dokumen BAST dan sign-off.',                   status: 'in_progress', start_date: '2026-04-05T00:00:00Z', target_date: '2026-04-25T00:00:00Z', created_at: '2026-03-18T00:00:00Z', updated_at: '2026-04-05T00:00:00Z' },
  ],
  r8: [
    { id: 'k17', requirement_id: 'r8',                   title: 'Export user data MyJobs',                         description: 'Dump data user aktif dari MyJobs existing.',                  status: 'in_progress', start_date: '2026-04-02T00:00:00Z', target_date: '2026-04-22T00:00:00Z', created_at: '2026-03-20T00:00:00Z', updated_at: '2026-04-03T00:00:00Z' },
    { id: 'k18', requirement_id: 'r8',                   title: 'Training tim baru MyJobs',                        description: 'Sesi training untuk tim pengelola baru.',                     status: 'todo',        start_date: '2026-05-01T00:00:00Z', target_date: '2026-05-10T00:00:00Z', created_at: '2026-03-20T00:00:00Z', updated_at: '2026-03-20T00:00:00Z' },
  ],
  r9: [
    { id: 'k19', requirement_id: 'r9',                   title: 'Transfer akses security group',                   description: 'Pemindahan hak akses security group dari BSS ke CEM.',        status: 'in_progress', start_date: '2026-03-20T00:00:00Z', target_date: '2026-04-30T00:00:00Z', created_at: '2026-02-25T00:00:00Z', updated_at: '2026-04-10T00:00:00Z' },
    { id: 'k20', requirement_id: 'r9',                   title: 'Audit compliance ISO 27001',                      description: 'Review kesesuaian dengan policy ISO 27001.',                  status: 'todo',        start_date: '2026-05-05T00:00:00Z', target_date: '2026-05-20T00:00:00Z', created_at: '2026-02-25T00:00:00Z', updated_at: '2026-02-25T00:00:00Z' },
    { id: 'k21', requirement_id: 'r9',                   title: 'Dokumentasi policy update',                       description: 'Update dokumen policy ISM untuk pengelola baru.',             status: 'todo',        start_date: '2026-05-10T00:00:00Z', target_date: '2026-05-28T00:00:00Z', created_at: '2026-02-25T00:00:00Z', updated_at: '2026-02-25T00:00:00Z' },
    { id: 'k22', requirement_id: 'r9',                   title: 'Handover session BSS → CEM',                      description: 'Final handover session dengan BSS dan CEM.',                  status: 'todo',                                                                                        created_at: '2026-02-25T00:00:00Z', updated_at: '2026-02-25T00:00:00Z' },
  ],
  r10: [
    { id: 'k23', requirement_id: 'r10',                  title: 'Inventarisasi aset Smart Capex',                  description: 'List seluruh server, DB, dan asset yang akan di-terminate.',  status: 'in_progress', start_date: '2026-04-01T00:00:00Z', target_date: '2026-04-30T00:00:00Z', created_at: '2026-03-25T00:00:00Z', updated_at: '2026-04-02T00:00:00Z' },
    { id: 'k24', requirement_id: 'r10',                  title: 'Archive data historis',                           description: 'Backup & archive seluruh data historis ke cold storage.',      status: 'todo',        start_date: '2026-05-05T00:00:00Z', target_date: '2026-05-25T00:00:00Z', created_at: '2026-03-25T00:00:00Z', updated_at: '2026-03-25T00:00:00Z' },
    { id: 'k25', requirement_id: 'r10',                  title: 'Decommissioning infrastructure',                  description: 'Decommission server & tutup akses jaringan.',                 status: 'todo',        start_date: '2026-06-01T00:00:00Z', target_date: '2026-06-20T00:00:00Z', created_at: '2026-03-25T00:00:00Z', updated_at: '2026-03-25T00:00:00Z' },
  ],
  r11: [
    { id: 'k26', requirement_id: 'r11', app_id: 'app5', title: 'Issue — Dev MO Add dan Del AP',                    description: 'Investigasi issue Dev MO Add/Del AP pada WMS Lite low-bandwidth.', status: 'in_progress', start_date: '2026-03-20T00:00:00Z', target_date: '2026-04-10T00:00:00Z', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-04-05T00:00:00Z' },
  ],
  r12: [
    { id: 'k27', requirement_id: 'r12', app_id: 'app6', title: 'D2P Multi SST MO Del & penyesuaian surrounding',   description: 'Deploy Multi SST dan penyesuaian LENSA, MyTech, UT Online, format BAI.', status: 'in_progress', start_date: '2026-04-01T00:00:00Z', target_date: '2026-05-10T00:00:00Z', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-04-10T00:00:00Z' },
  ],
  r13: [
    { id: 'k28', requirement_id: 'r13', app_id: 'app4', title: 'Dev AN Metro in OSS',                              description: 'Development modul Autonomous Network untuk Metro di OSS.',    status: 'in_progress', start_date: '2026-03-10T00:00:00Z', target_date: '2026-04-28T00:00:00Z', created_at: '2026-02-08T00:00:00Z', updated_at: '2026-04-02T00:00:00Z' },
  ],
  r14: [
    { id: 'k29', requirement_id: 'r14', app_id: 'app3', title: 'D2P API NOMS untuk AO',                            description: 'Deploy API NOMS untuk Account Owner ke production.',           status: 'in_progress', start_date: '2026-03-20T00:00:00Z', target_date: '2026-04-25T00:00:00Z', created_at: '2026-02-18T00:00:00Z', updated_at: '2026-04-05T00:00:00Z' },
    { id: 'k30', requirement_id: 'r14', app_id: 'app3', title: 'UAT API NOMS untuk MODOROSO',                      description: 'UAT untuk API NOMS pada flow MODOROSO.',                      status: 'in_progress', start_date: '2026-04-01T00:00:00Z', target_date: '2026-04-30T00:00:00Z', created_at: '2026-02-18T00:00:00Z', updated_at: '2026-04-08T00:00:00Z' },
    { id: 'k31', requirement_id: 'r14',                  title: 'Integrasi MyWifi',                                description: 'Integrasi Autonomous Network ke aplikasi MyWifi.',            status: 'todo',        start_date: '2026-04-25T00:00:00Z', target_date: '2026-05-15T00:00:00Z', created_at: '2026-02-18T00:00:00Z', updated_at: '2026-02-18T00:00:00Z' },
  ],
  r15: [
    { id: 'k32', requirement_id: 'r15',                  title: 'Follow up PIC Neta untuk CDR ke Billing',         description: 'Follow-up PIC Neta terkait pipeline CDR ke Billing.',         status: 'in_progress', start_date: '2026-03-28T00:00:00Z', target_date: '2026-04-10T00:00:00Z', created_at: '2026-02-22T00:00:00Z', updated_at: '2026-04-05T00:00:00Z' },
  ],
  r16: [
    { id: 'k33', requirement_id: 'r16',                  title: 'Design JWT token schema MyIndiHome API',          description: 'Definisi payload access + refresh token.',                    status: 'done',        start_date: '2026-01-25T00:00:00Z', target_date: '2026-02-05T00:00:00Z', created_at: '2026-01-25T00:00:00Z', updated_at: '2026-02-05T00:00:00Z' },
    { id: 'k34', requirement_id: 'r16',                  title: 'Integrasi endpoint billing',                      description: 'Integrasi endpoint billing MyIndiHome.',                      status: 'done',        start_date: '2026-02-06T00:00:00Z', target_date: '2026-02-28T00:00:00Z', created_at: '2026-02-06T00:00:00Z', updated_at: '2026-02-28T00:00:00Z' },
    { id: 'k35', requirement_id: 'r16',                  title: 'Revenue leakage monitor dashboard',               description: 'Dashboard monitoring leakage di DBA.',                        status: 'done',        start_date: '2026-03-01T00:00:00Z', target_date: '2026-03-28T00:00:00Z', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-28T00:00:00Z' },
  ],
  r18: [
    { id: 'k36', requirement_id: 'r18',                  title: 'Design audit_logs table',                         description: 'actor, action, target_type, target_id, diff JSON.',          status: 'done',        start_date: '2026-02-15T00:00:00Z', target_date: '2026-02-20T00:00:00Z', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
    { id: 'k37', requirement_id: 'r18',                  title: 'Hook into GORM callbacks',                        description: 'BeforeUpdate / BeforeDelete untuk audit write-through.',      status: 'done',        start_date: '2026-02-22T00:00:00Z', target_date: '2026-03-05T00:00:00Z', created_at: '2026-02-22T00:00:00Z', updated_at: '2026-03-05T00:00:00Z' },
    { id: 'k38', requirement_id: 'r18',                  title: 'Audit log API endpoint',                          description: 'GET /audit-logs dengan filters.',                             status: 'in_progress', start_date: '2026-03-10T00:00:00Z', target_date: '2026-04-20T00:00:00Z', created_at: '2026-03-10T00:00:00Z', updated_at: '2026-04-10T00:00:00Z' },
    { id: 'k39', requirement_id: 'r18',                  title: 'Frontend audit log viewer',                       description: 'Table dengan diff expansion.',                                status: 'todo',        start_date: '2026-04-22T00:00:00Z', target_date: '2026-05-05T00:00:00Z', created_at: '2026-03-12T00:00:00Z', updated_at: '2026-03-12T00:00:00Z' },
  ],
  r19: [
    { id: 'k40', requirement_id: 'r19',                  title: 'Integrate @dnd-kit',                              description: 'Setup DndContext & SortableContext per kolom status.',        status: 'done',        start_date: '2026-02-06T00:00:00Z', target_date: '2026-02-12T00:00:00Z', created_at: '2026-02-06T00:00:00Z', updated_at: '2026-02-12T00:00:00Z' },
    { id: 'k41', requirement_id: 'r19',                  title: 'Persist drag reorder ke backend',                 description: 'PATCH /requirements/reorder on drop.',                        status: 'done',        start_date: '2026-02-12T00:00:00Z', target_date: '2026-02-20T00:00:00Z', created_at: '2026-02-12T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
    { id: 'k42', requirement_id: 'r19',                  title: 'Drop animation polish',                           description: 'Spring easing, overlay card, column glow on hover.',         status: 'in_progress', start_date: '2026-02-22T00:00:00Z', target_date: '2026-04-25T00:00:00Z', created_at: '2026-02-22T00:00:00Z', updated_at: '2026-04-10T00:00:00Z' },
  ],
  r17: [
    { id: 'k44', requirement_id: 'r17',                  title: 'Bispro tiered pricing Wholesale',                 description: 'Rancang skema tiered pricing multi-produk segmen Wholesale.', status: 'done',        start_date: '2026-02-01T00:00:00Z', target_date: '2026-02-28T00:00:00Z', created_at: '2026-01-28T00:00:00Z', updated_at: '2026-02-28T00:00:00Z' },
    { id: 'k45', requirement_id: 'r17',                  title: 'Invoice konsolidasi multi-produk',                description: 'Implementasi invoice konsolidasi lintas produk.',             status: 'done',        start_date: '2026-03-01T00:00:00Z', target_date: '2026-03-25T00:00:00Z', created_at: '2026-02-01T00:00:00Z', updated_at: '2026-03-25T00:00:00Z' },
  ],
  r20: [
    { id: 'k46', requirement_id: 'r20',                  title: 'Parser query multi-field',                        description: 'Kombinasi filter status/priority/tag/assignee di satu input.', status: 'in_progress', start_date: '2026-03-01T00:00:00Z', target_date: '2026-04-28T00:00:00Z', created_at: '2026-02-22T00:00:00Z', updated_at: '2026-04-05T00:00:00Z' },
    { id: 'k47', requirement_id: 'r20',                  title: 'Saved preset & URL deep-link',                    description: 'Persist preset filter & sync ke URL query string.',           status: 'todo',        start_date: '2026-05-01T00:00:00Z', target_date: '2026-05-20T00:00:00Z', created_at: '2026-02-22T00:00:00Z', updated_at: '2026-02-22T00:00:00Z' },
  ],
  r21: [
    { id: 'k48', requirement_id: 'r21',                  title: 'CSV export service',                              description: 'Streaming CSV export dengan filter aktif.',                   status: 'todo',                                                                                       created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
    { id: 'k49', requirement_id: 'r21',                  title: 'PDF template branded Telkom',                     description: 'Template PDF dengan header/footer branded Telkom.',           status: 'todo',                                                                                       created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  ],
  r22: [
    { id: 'k50', requirement_id: 'r22',                  title: 'Redis token bucket middleware',                   description: 'Rate limiter per-user & per-IP via Redis.',                   status: 'todo',                                                                                       created_at: '2026-04-08T00:00:00Z', updated_at: '2026-04-08T00:00:00Z' },
    { id: 'k51', requirement_id: 'r22',                  title: 'Alerting abuse detection',                        description: 'Alert saat threshold abuse terlampaui.',                      status: 'todo',                                                                                       created_at: '2026-04-08T00:00:00Z', updated_at: '2026-04-08T00:00:00Z' },
  ],
  r23: [
    { id: 'k52', requirement_id: 'r23',                  title: 'Email service (SMTP) integration',                description: 'Integrasi SMTP untuk notifikasi transaksional.',              status: 'todo',                                                                                       created_at: '2026-03-03T00:00:00Z', updated_at: '2026-03-03T00:00:00Z' },
    { id: 'k53', requirement_id: 'r23',                  title: 'Daily digest scheduler',                          description: 'Cron digest harian dengan aggregation per user.',             status: 'todo',                                                                                       created_at: '2026-03-03T00:00:00Z', updated_at: '2026-03-03T00:00:00Z' },
  ],
  r24: [
    { id: 'k54', requirement_id: 'r24',                  title: 'Setup react-i18next + locale bundle',             description: 'Konfigurasi i18next & lazy-load locale bundles.',             status: 'todo',                                                                                       created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-10T00:00:00Z' },
    { id: 'k55', requirement_id: 'r24',                  title: 'Translate ID strings — core flows',               description: 'Translasi string Bahasa Indonesia untuk flow utama.',         status: 'todo',                                                                                       created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-10T00:00:00Z' },
  ],
  r25: [
    { id: 'k56', requirement_id: 'r25',                  title: 'Wizard step — Org setup',                         description: 'Step pertama wizard onboarding untuk setup organisasi.',      status: 'todo',                                                                                       created_at: '2026-03-12T00:00:00Z', updated_at: '2026-03-12T00:00:00Z' },
    { id: 'k57', requirement_id: 'r25',                  title: 'Wizard step — Invite users',                      description: 'Undang user awal dengan role default.',                       status: 'todo',                                                                                       created_at: '2026-03-12T00:00:00Z', updated_at: '2026-03-12T00:00:00Z' },
    { id: 'k58', requirement_id: 'r25',                  title: 'Tutorial tooltip engine',                         description: 'Overlay tutorial interaktif untuk first-time users.',         status: 'todo',                                                                                       created_at: '2026-03-12T00:00:00Z', updated_at: '2026-03-12T00:00:00Z' },
  ],
}

// ─── Dashboard supporting data ────────────────────────────────────────────────

const mockOverdueList: DashboardReqItem[] = [
  { id: 'r11', title: 'WMS Lite Low Bandwidth',                                         priority: 'high',     status: 'production_test', due_date: '2026-04-10T00:00:00Z', assigned_to: mockUsers[1] },
  { id: 'r15', title: 'Update Bispro WMS Hotel',                                        priority: 'medium',   status: 'uat',             due_date: '2026-04-10T00:00:00Z', assigned_to: mockUsers[1] },
]

const mockUpcomingList: DashboardReqItem[] = [
  { id: 'r18', title: 'Role Permission Audit Trail',                                    priority: 'high',     status: 'production_test', due_date: daysFromNow(3),  assigned_to: mockUsers[0] },
  { id: 'r2',  title: 'Alih Kelola MyBrains',                                           priority: 'high',     status: 'development',     due_date: daysFromNow(7),  assigned_to: mockUsers[0] },
  { id: 'r13', title: 'Autonomous Network for Metro',                                   priority: 'high',     status: 'uat',             due_date: daysFromNow(10), assigned_to: mockUsers[1] },
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
  by_assignee: mockUsers.map(u => ({
    user_id:   u.id,
    full_name: u.full_name,
    count:     mockRequirements.filter(r => r.assigned_to_id === u.id && r.status !== 'completed').length,
  })),
  throughput: [
    { week: relWeek(7), count: 2 },
    { week: relWeek(6), count: 3 },
    { week: relWeek(5), count: 4 },
    { week: relWeek(4), count: 2 },
    { week: relWeek(3), count: 5 },
    { week: relWeek(2), count: 4 },
    { week: relWeek(1), count: 6 },
    { week: relWeek(0), count: 3 },
  ],
  overdue_list:  mockOverdueList,
  upcoming_list: mockUpcomingList,
  recent_activity: [
    { ...mockActivity[3], requirement_title: 'Multi SST MO Del & Penyesuaian Surrounding LENSA/MyTech' },
    { ...mockActivity[4], requirement_title: 'Integrasi API MyIndiHome ke Digital Business Assurance' },
    { ...mockActivity[5], requirement_title: 'Autonomous Network for WiFi' },
    { ...mockActivity[0], requirement_title: 'Alih Kelola Telkom Solution' },
    { ...mockActivity[1], requirement_title: 'Alih Kelola Telkom Solution' },
  ],
}

export const mockNotifications: Notification[] = [
  { id: 'n1', user_id: 'u1', message: 'Multi SST MO Del — status berubah ke D2P',                    link: '/requirements', is_read: false, created_at: '2026-04-08T10:00:00Z' },
  { id: 'n2', user_id: 'u1', message: 'Integrasi API MyIndiHome berhasil masuk Completed',            link: '/requirements', is_read: false, created_at: '2026-04-01T11:00:00Z' },
  { id: 'n3', user_id: 'u1', message: 'Bagus Laksono commented pada Multi SST MO Del',                link: '/requirements', is_read: true,  created_at: '2026-04-10T11:00:00Z' },
  { id: 'n4', user_id: 'u2', message: 'Di-assign ke Autonomous Network for WiFi',                     link: '/requirements', is_read: false, created_at: '2026-04-02T09:00:00Z' },
  { id: 'n5', user_id: 'u2', message: 'UAT API NOMS MODOROSO memasuki tahap akhir',                   link: '/requirements', is_read: false, created_at: '2026-04-08T15:30:00Z' },
  { id: 'n8', user_id: 'u3', message: 'Backlog 04 — Transaction Validation butuh review',             link: '/requirements', is_read: false, created_at: '2026-04-12T14:00:00Z' },
  { id: 'n6', user_id: 'u3', message: 'Multi SST MO Del siap deployment D2P',                         link: '/requirements', is_read: true,  created_at: '2026-04-10T11:00:00Z' },
  { id: 'n7', user_id: 'u4', message: 'Rona di-mention pada Alih Kelola EPIC/Andien/Raline',          link: '/requirements', is_read: false, created_at: '2026-03-26T14:00:00Z' },
]
