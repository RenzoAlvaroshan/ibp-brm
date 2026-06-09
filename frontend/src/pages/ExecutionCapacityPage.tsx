import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  Activity,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Clock3,
  ClipboardCheck,
  Gauge,
  ListChecks,
  NotebookText,
  PieChart as PieChartIcon,
  TrendingUp,
  UserRound,
  Users2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils'
import { useI18n, type TranslationKey } from '@/i18n'

type Tone = 'red' | 'orange' | 'purple' | 'blue' | 'green' | 'teal' | 'slate'
type CapacityStatus = 'overloaded' | 'high' | 'normal' | 'available'
type PriorityLevel = 'critical' | 'high' | 'medium' | 'low'

interface ExecutionKpi {
  labelKey: TranslationKey
  value: string
  badge?: string
  badgeKey?: TranslationKey
  suffixKey?: TranslationKey
  tone: Tone
  icon: LucideIcon
  href: string
}

interface AssigneeWorkload {
  name: string
  active: number
  highPriority: number
  overdue: number
  status: CapacityStatus
}

interface RequirementRow {
  requirementKey: TranslationKey
  stageKey?: TranslationKey
  dueDate?: string
  assignee?: string
  priority: PriorityLevel
  slug: string
}

interface ActivityItem {
  actor: string
  initials: string
  actionKey: TranslationKey
  requirementKey: TranslationKey
  suffixKey?: TranslationKey
  detailKey?: TranslationKey
  timeKey: TranslationKey
  slug: string
}

// This page preserves and reorganizes operational widgets from the old dashboard under Dashboard > Execution & Capacity.
const executionKpis: ExecutionKpi[] = [
  {
    labelKey: 'execution.kpi.teamCapacity',
    value: '76%',
    badgeKey: 'execution.badge.loaded',
    tone: 'purple',
    icon: Gauge,
    href: '/requirements?view=capacity',
  },
  {
    labelKey: 'execution.kpi.activeAssignees',
    value: '5',
    badge: '+1',
    suffixKey: 'kpi.trend.vsLastWeek',
    tone: 'blue',
    icon: Users2,
    href: '/requirements?group=assignee',
  },
  {
    labelKey: 'execution.kpi.dueThisWeek',
    value: '3',
    badge: '+25%',
    suffixKey: 'kpi.trend.vsLastWeek',
    tone: 'orange',
    icon: CalendarClock,
    href: '/requirements?due=this-week',
  },
  {
    labelKey: 'execution.kpi.weeklyCompletions',
    value: '6',
    badge: '+20%',
    suffixKey: 'kpi.trend.vsLastWeek',
    tone: 'green',
    icon: CheckCircle2,
    href: '/requirements?status=completed',
  },
]

const assigneeWorkload: AssigneeWorkload[] = [
  { name: 'Renzo', active: 12, highPriority: 6, overdue: 1, status: 'overloaded' },
  { name: 'Bagus', active: 7, highPriority: 3, overdue: 2, status: 'high' },
  { name: 'Sari', active: 1, highPriority: 0, overdue: 0, status: 'normal' },
  { name: 'Rona', active: 0, highPriority: 0, overdue: 0, status: 'available' },
  { name: 'Gama', active: 0, highPriority: 0, overdue: 0, status: 'available' },
]

const dueThisWeek: RequirementRow[] = [
  {
    requirementKey: 'execution.req.rolePermissionAuditTrail',
    dueDate: '3 Jun',
    assignee: 'Renzo Alvaroshan',
    priority: 'high',
    slug: 'role-permission-audit-trail',
  },
  {
    requirementKey: 'execution.req.alihKelolaMyBrains',
    dueDate: '5 Jun',
    assignee: 'Bagus Laksono',
    priority: 'high',
    slug: 'alih-kelola-mybrains',
  },
  {
    requirementKey: 'execution.req.autonomousNetworkMetro',
    dueDate: '6 Jun',
    assignee: 'Sari Wulandari',
    priority: 'medium',
    slug: 'autonomous-network-for-metro',
  },
]

const myRequirements: RequirementRow[] = [
  { requirementKey: 'execution.req.rolePermissionAuditTrail', stageKey: 'execution.stage.validation', priority: 'high', slug: 'role-permission-audit-trail' },
  { requirementKey: 'execution.req.advancedSearchFiltering', stageKey: 'execution.stage.design', priority: 'medium', slug: 'advanced-search-filtering-requirements' },
  { requirementKey: 'management.req.alihKelolaTelkomSolution', stageKey: 'execution.stage.implementation', priority: 'high', slug: 'alih-kelola-telkom-solution' },
  { requirementKey: 'execution.req.alihKelolaMyBrains', stageKey: 'execution.stage.implementation', priority: 'high', slug: 'alih-kelola-mybrains' },
  { requirementKey: 'execution.req.alihKelolaEpicAndienRaline', stageKey: 'execution.stage.planning', priority: 'medium', slug: 'alih-kelola-epic-andien-raline-mytens-gobeyond' },
]

const recentActivity: ActivityItem[] = [
  {
    actor: 'Bagus Laksono',
    initials: 'BL',
    actionKey: 'execution.activity.updatedRequirement',
    requirementKey: 'execution.req.alihKelolaMyBrains',
    detailKey: 'execution.activity.detail.implementation',
    timeKey: 'execution.time.2hAgo',
    slug: 'alih-kelola-mybrains',
  },
  {
    actor: 'Renzo Alvaroshan',
    initials: 'RA',
    actionKey: 'execution.activity.commentedOn',
    requirementKey: 'execution.req.rolePermissionAuditTrail',
    detailKey: 'execution.activity.detail.roleMapping',
    timeKey: 'execution.time.4hAgo',
    slug: 'role-permission-audit-trail',
  },
  {
    actor: 'Bagus Laksono',
    initials: 'BL',
    actionKey: 'execution.activity.marked',
    requirementKey: 'execution.req.autonomousNetworkMetro',
    suffixKey: 'execution.activity.suffix.atRisk',
    detailKey: 'execution.activity.detail.vendorDependency',
    timeKey: 'execution.time.6hAgo',
    slug: 'autonomous-network-for-metro',
  },
  {
    actor: 'Renzo Alvaroshan',
    initials: 'RA',
    actionKey: 'execution.activity.closedRequirement',
    requirementKey: 'execution.req.advancedSearchFiltering',
    timeKey: 'execution.time.7dAgo',
    slug: 'advanced-search-filtering-requirements',
  },
]

const requestingUnitSla = [
  { labelKey: 'requestingUnit.enterprise', unit: 'Enterprise', value: 82 },
  { labelKey: 'requestingUnit.wholesale', unit: 'Wholesale', value: 78 },
  { labelKey: 'requestingUnit.hcm', unit: 'HCM', value: 91 },
  { labelKey: 'requestingUnit.finance', unit: 'Finance', value: 86 },
  { labelKey: 'requestingUnit.consumer', unit: 'Consumer', value: 88 },
] satisfies { labelKey: TranslationKey; unit: string; value: number }[]

const operationalNoteKeys: TranslationKey[] = [
  'execution.note.businessFeedback',
  'execution.note.dryRun',
  'execution.note.ownershipFormalization',
]

const statusDistribution = [
  { labelKey: 'execution.status.todo', value: 3, color: '#94a3b8', query: 'todo' },
  { labelKey: 'execution.status.requirementGathering', value: 2, color: '#3b82f6', query: 'requirement_gathering' },
  { labelKey: 'execution.status.development', value: 10, color: '#6d5dfc', query: 'development' },
  { labelKey: 'execution.status.sit', value: 2, color: '#f59e0b', query: 'sit' },
  { labelKey: 'execution.status.uat', value: 3, color: '#8b5cf6', query: 'uat' },
  { labelKey: 'execution.status.d2p', value: 1, color: '#ec4899', query: 'd2p' },
  { labelKey: 'execution.status.productionTest', value: 2, color: '#f97316', query: 'production_test' },
  { labelKey: 'execution.status.completed', value: 2, color: '#10b981', query: 'completed' },
] satisfies { labelKey: TranslationKey; value: number; color: string; query: string }[]

const priorityDistribution = [
  { labelKey: 'priority.critical', priority: 'critical', value: 3, color: '#ef4444' },
  { labelKey: 'priority.high', priority: 'high', value: 8, color: '#f97316' },
  { labelKey: 'priority.medium', priority: 'medium', value: 10, color: '#3b82f6' },
  { labelKey: 'priority.low', priority: 'low', value: 4, color: '#94a3b8' },
] satisfies { labelKey: TranslationKey; priority: PriorityLevel; value: number; color: string }[]

function toneClasses(tone: Tone) {
  const map: Record<Tone, string> = {
    red: 'bg-red-50 text-red-700 ring-red-200',
    orange: 'bg-orange-50 text-orange-700 ring-orange-200',
    purple: 'bg-violet-50 text-violet-700 ring-violet-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    teal: 'bg-teal-50 text-teal-700 ring-teal-200',
    slate: 'bg-slate-50 text-slate-600 ring-slate-200',
  }
  return map[tone]
}

function iconToneClasses(tone: Tone) {
  const map: Record<Tone, string> = {
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-violet-50 text-violet-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    teal: 'bg-teal-50 text-teal-600',
    slate: 'bg-slate-50 text-slate-600',
  }
  return map[tone]
}

function capacityTone(status: CapacityStatus): Tone {
  const map: Record<CapacityStatus, Tone> = {
    overloaded: 'red',
    high: 'orange',
    normal: 'green',
    available: 'blue',
  }
  return map[status]
}

function capacityLabelKey(status: CapacityStatus): TranslationKey {
  const map: Record<CapacityStatus, TranslationKey> = {
    overloaded: 'capacity.overloaded',
    high: 'capacity.high',
    normal: 'capacity.normal',
    available: 'capacity.available',
  }
  return map[status]
}

function priorityTone(priority: PriorityLevel): Tone {
  const map: Record<PriorityLevel, Tone> = {
    critical: 'red',
    high: 'orange',
    medium: 'blue',
    low: 'slate',
  }
  return map[priority]
}

function priorityLabelKey(priority: PriorityLevel): TranslationKey {
  const map: Record<PriorityLevel, TranslationKey> = {
    critical: 'priority.critical',
    high: 'priority.high',
    medium: 'priority.medium',
    low: 'priority.low',
  }
  return map[priority]
}

function slaTone(value: number): Tone {
  if (value >= 90) return 'green'
  if (value >= 80) return 'purple'
  return 'orange'
}

function slaColor(value: number) {
  if (value >= 90) return '#10b981'
  if (value >= 80) return '#6d5dfc'
  return '#f97316'
}

function CardShell({
  title,
  subtitle,
  icon,
  children,
  className,
}: {
  title: string
  subtitle?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.05)]', className)}>
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        {icon && (
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold text-slate-950">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[12px] text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function ChartTooltip({ active, payload }: any) {
  const { t } = useI18n()
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] shadow-xl shadow-slate-900/10">
      {payload.map((item: any) => (
        <p key={`${item.name}-${item.value}`} className="font-medium" style={{ color: item.payload?.color || item.fill }}>
          {item.value} {t('unit.items')}
        </p>
      ))}
    </div>
  )
}

function PriorityPill({ priority }: { priority: PriorityLevel }) {
  const { t } = useI18n()
  return (
    <span className={cn('inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ring-1', toneClasses(priorityTone(priority)))}>
      {t(priorityLabelKey(priority))}
    </span>
  )
}

function CapacityPill({ status }: { status: CapacityStatus }) {
  const { t } = useI18n()
  return (
    <span className={cn('inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ring-1', toneClasses(capacityTone(status)))}>
      {t(capacityLabelKey(status))}
    </span>
  )
}

function KpiCard({ item }: { item: ExecutionKpi }) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const Icon = item.icon

  return (
    <button
      type="button"
      onClick={() => navigate(item.href)}
      className="group rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_14px_32px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_20px_44px_rgba(79,70,229,0.12)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconToneClasses(item.tone))}>
          <Icon size={19} />
        </div>
        <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1', toneClasses(item.tone))}>
          {item.badgeKey ? t(item.badgeKey) : item.badge}
          {item.suffixKey && <span className="ml-1 hidden xl:inline">{t(item.suffixKey)}</span>}
        </span>
      </div>
      <p className="mt-4 text-[12px] font-medium text-slate-500">{t(item.labelKey)}</p>
      <p className="mt-1 text-[30px] font-semibold tracking-tight text-slate-950">{item.value}</p>
    </button>
  )
}

function WorkloadCard() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const max = Math.max(...assigneeWorkload.map((item) => item.active), 1)

  return (
    <CardShell title={t('execution.section.workloadByAssignee')} subtitle={t('execution.section.workloadByAssignee.subtitle')} icon={<Users2 size={17} />}>
      <div className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          {assigneeWorkload.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => navigate(`/requirements?assignee=${encodeURIComponent(item.name)}`)}
              className="group grid w-full grid-cols-[72px_1fr_42px] items-center gap-3 text-left"
            >
              <span className="truncate text-[12px] font-semibold text-slate-600 group-hover:text-violet-700">{item.name}</span>
              <span className="h-3 rounded-full bg-slate-100">
                <span
                  className="block h-3 rounded-full shadow-sm transition-all group-hover:brightness-95"
                  style={{ width: `${(item.active / max) * 100}%`, backgroundColor: statusColor(item.status) }}
                />
              </span>
              <span className="text-right text-[13px] font-semibold text-slate-950">{item.active}</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] table-fixed border-separate border-spacing-0 text-left">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[12%]" />
              <col className="w-[18%]" />
              <col className="w-[14%]" />
              <col className="w-[34%]" />
            </colgroup>
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.08em] text-slate-400">
                <th className="pb-3 pr-3 font-semibold">{t('table.brmAssignee')}</th>
                <th className="pb-3 pr-3 text-right font-semibold">{t('table.active')}</th>
                <th className="pb-3 pr-3 text-right font-semibold">{t('table.highPriority')}</th>
                <th className="pb-3 pr-3 text-right font-semibold">{t('table.overdue')}</th>
                <th className="pb-3 text-right font-semibold">{t('table.capacityStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {assigneeWorkload.map((item) => (
                <tr
                  key={item.name}
                  onClick={() => navigate(`/requirements?assignee=${encodeURIComponent(item.name)}`)}
                  className="group cursor-pointer text-[13px] text-slate-700"
                >
                  <td className="border-t border-slate-100 py-3 pr-3 font-semibold text-slate-950 group-hover:text-violet-700">
                    {item.name}
                  </td>
                  <td className="border-t border-slate-100 py-3 pr-3 text-right font-semibold">{item.active}</td>
                  <td className="border-t border-slate-100 py-3 pr-3 text-right">{item.highPriority}</td>
                  <td className={cn('border-t border-slate-100 py-3 pr-3 text-right font-medium', item.overdue > 0 ? 'text-red-600' : 'text-slate-500')}>
                    {item.overdue}
                  </td>
                  <td className="border-t border-slate-100 py-3 text-right">
                    <CapacityPill status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CardShell>
  )
}

function statusColor(status: CapacityStatus) {
  const map: Record<CapacityStatus, string> = {
    overloaded: '#ef4444',
    high: '#f97316',
    normal: '#10b981',
    available: '#3b82f6',
  }
  return map[status]
}

function DueThisWeekCard() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <CardShell title={t('execution.section.dueThisWeek')} icon={<CalendarClock size={17} />} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0 text-left">
          <colgroup>
            <col className="w-[35%]" />
            <col className="w-[14%]" />
            <col className="w-[31%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.08em] text-slate-400">
              <th className="pb-3 pr-3 font-semibold">{t('table.requirement')}</th>
              <th className="pb-3 pr-3 font-semibold">{t('table.dueDate')}</th>
              <th className="pb-3 pr-3 font-semibold">{t('table.brmAssignee')}</th>
              <th className="pb-3 text-right font-semibold">{t('table.priority')}</th>
            </tr>
          </thead>
          <tbody>
            {dueThisWeek.map((row) => (
              <tr
                key={row.requirementKey}
                onClick={() => navigate(`/requirements/detail/${row.slug}`)}
                className="group cursor-pointer text-[13px] text-slate-700"
              >
                <td className="border-t border-slate-100 py-3 pr-3 font-semibold leading-snug text-slate-950 group-hover:text-violet-700">
                  {t(row.requirementKey)}
                </td>
                <td className="border-t border-slate-100 py-3 pr-3 font-medium">{row.dueDate}</td>
                <td className="truncate border-t border-slate-100 py-3 pr-3">{row.assignee}</td>
                <td className="border-t border-slate-100 py-3 text-right">
                  <PriorityPill priority={row.priority} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  )
}

function MyRequirementsCard() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <CardShell title={t('execution.section.myRequirements')} icon={<UserRound size={17} />} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0 text-left">
          <colgroup>
            <col className="w-[50%]" />
            <col className="w-[25%]" />
            <col className="w-[25%]" />
          </colgroup>
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.08em] text-slate-400">
              <th className="pb-3 pr-3 font-semibold">{t('table.requirement')}</th>
              <th className="pb-3 pr-3 font-semibold">{t('table.stage')}</th>
              <th className="pb-3 text-right font-semibold">{t('table.priority')}</th>
            </tr>
          </thead>
          <tbody>
            {myRequirements.map((row) => (
              <tr
                key={row.slug}
                onClick={() => navigate(`/requirements/detail/${row.slug}`)}
                className="group cursor-pointer text-[13px] text-slate-700"
              >
                <td className="border-t border-slate-100 py-3 pr-3 font-semibold leading-snug text-slate-950 group-hover:text-violet-700">
                  {t(row.requirementKey)}
                </td>
                <td className="border-t border-slate-100 py-3 pr-3">{row.stageKey ? t(row.stageKey) : '-'}</td>
                <td className="border-t border-slate-100 py-3 text-right">
                  <PriorityPill priority={row.priority} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  )
}

function RecentActivityCard() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <CardShell title={t('execution.section.recentActivity')} icon={<Activity size={17} />}>
      <div className="space-y-3">
        {recentActivity.map((item) => (
          <button
            key={`${item.slug}-${item.timeKey}`}
            type="button"
            onClick={() => navigate(`/requirements/detail/${item.slug}`)}
            className="group flex w-full gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-left transition-colors hover:border-violet-200 hover:bg-violet-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700 ring-1 ring-violet-200">
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-snug text-slate-600">
                <span className="font-semibold text-slate-950 group-hover:text-violet-700">{item.actor}</span>
                <span> {t(item.actionKey)} </span>
                <span className="font-semibold text-slate-900">{t(item.requirementKey)}</span>
                {item.suffixKey && <span> {t(item.suffixKey)}</span>}
              </p>
              {item.detailKey && <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{t(item.detailKey)}</p>}
            </div>
            <span className="shrink-0 text-[11px] font-medium text-slate-400">{t(item.timeKey)}</span>
          </button>
        ))}
      </div>
    </CardShell>
  )
}

function SlaPerformanceCard() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <CardShell title={t('execution.section.requestingUnitSla')} icon={<TrendingUp size={17} />}>
      <div className="space-y-3">
        {requestingUnitSla.map((item) => (
          <button
            key={item.unit}
            type="button"
            onClick={() => navigate(`/requirements?requestingUnit=${encodeURIComponent(item.unit)}`)}
            className="group grid w-full grid-cols-[92px_1fr_44px] items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-violet-50"
          >
            <span className="truncate text-[12px] font-medium text-slate-600 group-hover:text-violet-700">{t(item.labelKey)}</span>
            <span className="h-2.5 rounded-full bg-slate-100">
              <span className="block h-2.5 rounded-full" style={{ width: `${item.value}%`, backgroundColor: slaColor(item.value) }} />
            </span>
            <span className={cn('text-right text-[13px] font-semibold', toneClasses(slaTone(item.value)).split(' ')[1])}>{item.value}%</span>
          </button>
        ))}
      </div>
    </CardShell>
  )
}

function OperationalNotesCard() {
  const { t } = useI18n()

  return (
    <CardShell title={t('execution.section.operationalNotes')} icon={<NotebookText size={17} />}>
      <div className="space-y-3">
        {operationalNoteKeys.map((key) => (
          <div key={key} className="flex gap-3 rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
            <CircleDot size={15} className="mt-0.5 shrink-0 text-violet-600" />
            <p className="text-[13px] leading-relaxed text-slate-600">{t(key)}</p>
          </div>
        ))}
      </div>
    </CardShell>
  )
}

function StatusDistributionCard() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const max = Math.max(...statusDistribution.map((item) => item.value))

  return (
    <CardShell title={t('execution.section.statusDistribution')} icon={<BarChart3 size={17} />}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
        {statusDistribution.map((item) => (
          <button
            key={item.query}
            type="button"
            onClick={() => navigate(`/requirements?status=${encodeURIComponent(item.query)}`)}
            className="group rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-left transition-colors hover:border-violet-200 hover:bg-violet-50"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-semibold text-slate-600 group-hover:text-violet-700">{t(item.labelKey)}</span>
              <span className="text-[13px] font-semibold text-slate-950">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-white">
              <div className="h-2 rounded-full" style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }} />
            </div>
          </button>
        ))}
      </div>
    </CardShell>
  )
}

function PriorityDistributionCard() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const total = priorityDistribution.reduce((sum, item) => sum + item.value, 0)
  const chartData = useMemo(
    () => priorityDistribution.map((item) => ({ ...item, name: t(item.labelKey) })),
    [t],
  )

  return (
    <CardShell title={t('execution.section.priorityDistribution')} icon={<PieChartIcon size={17} />}>
      <div className="grid gap-4 sm:grid-cols-[170px_1fr] xl:grid-cols-1 2xl:grid-cols-[170px_1fr]">
        <div className="relative h-[170px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={46} outerRadius={66} paddingAngle={3} isAnimationActive={false}>
                {chartData.map((item) => (
                  <Cell key={item.priority} fill={item.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[24px] font-semibold tracking-tight text-slate-950">{total}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{t('portfolio.label.total')}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2 self-center">
          {priorityDistribution.map((item) => (
            <button
              key={item.priority}
              type="button"
              onClick={() => navigate(`/requirements?priority=${encodeURIComponent(item.priority)}`)}
              className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-left transition-colors hover:border-violet-200 hover:bg-violet-50"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate text-[12px] font-medium text-slate-700 group-hover:text-violet-700">{t(item.labelKey)}</span>
              </span>
              <span className="text-[13px] font-semibold text-slate-950">{item.value}</span>
            </button>
          ))}
        </div>
      </div>
    </CardShell>
  )
}

export default function ExecutionCapacityPage() {
  const { t } = useI18n()

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50/70 p-5 shadow-[0_18px_42px_rgba(79,70,229,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-700 ring-1 ring-violet-100">
              <ClipboardCheck size={13} />
              {t('page.executionCapacity.eyebrow')}
            </div>
            <h1 className="text-[28px] font-semibold tracking-tight text-slate-950">{t('page.executionCapacity.title')}</h1>
            <p className="mt-1 text-[14px] text-slate-500">{t('page.executionCapacity.subtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 ring-1 ring-slate-200">
              <ListChecks size={13} className="text-violet-600" />
              {t('execution.label.weeklyReview')}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 ring-1 ring-slate-200">
              <Clock3 size={13} className="text-orange-600" />
              3 {t('execution.kpi.dueThisWeek')}
            </span>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {executionKpis.map((item) => (
          <KpiCard key={item.labelKey} item={item} />
        ))}
      </section>

      <WorkloadCard />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <DueThisWeekCard />
        <MyRequirementsCard />
      </section>

      <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <RecentActivityCard />
        <div className="grid gap-5">
          <SlaPerformanceCard />
          <OperationalNotesCard />
        </div>
      </section>

      <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <StatusDistributionCard />
        <PriorityDistributionCard />
      </section>

      <section className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4 text-[13px] leading-relaxed text-violet-900">
        <span className="font-semibold">{t('note.executionScope')}</span>
        <span> {t('note.executionScope.description')}</span>
      </section>
    </div>
  )
}
