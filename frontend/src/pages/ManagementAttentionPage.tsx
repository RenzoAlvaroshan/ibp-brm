import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertOctagon, AlertTriangle, ArrowRight, Ban, CalendarClock, CircleDot,
  Clock3, FileWarning, Filter, Flame, GanttChartSquare, Hourglass, Layers3,
  Scale, ShieldAlert, Siren, SlidersHorizontal, Target, Users2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils'
import { useI18n, type TranslationKey } from '@/i18n'

type Tone = 'red' | 'orange' | 'purple' | 'blue' | 'green' | 'yellow' | 'slate'
type DecisionStatus = 'pending' | 'inReview' | 'escalated' | 'awaitingConfirmation'
type RiskLevel = 'critical' | 'high' | 'medium' | 'low'
type HeatmapImpact = 'low' | 'medium' | 'high'
type HeatmapProbability = 'low' | 'medium' | 'high'

interface AttentionKpi {
  labelKey: TranslationKey
  value: number
  trend: string
  tone: Tone
  icon: LucideIcon
  query: string
}

interface DecisionRow {
  requirementKey: TranslationKey
  dependencyKey: TranslationKey
  requestedDecisionKey: TranslationKey
  executiveOwner: string
  deadline: string
  status: DecisionStatus
  detailSlug: string
  priority: 'high' | 'medium'
  requestingUnit: string
  internalItOwner: string
  initiative: string
  riskLevel: RiskLevel
}

interface AgingRequirement {
  requirementKey: TranslationKey
  age: number
  stageKey: TranslationKey
  internalItOwner: string
  riskLevel: RiskLevel
  detailSlug: string
}

const kpis: AttentionKpi[] = [
  { labelKey: 'management.kpi.criticalDecisions', value: 4, trend: '+2', tone: 'red', icon: AlertOctagon, query: 'critical decisions' },
  { labelKey: 'management.kpi.overdueHighPriority', value: 3, trend: '+1', tone: 'orange', icon: CalendarClock, query: 'overdue high priority' },
  { labelKey: 'management.kpi.blockedItems', value: 2, trend: '+1', tone: 'red', icon: Ban, query: 'blocked' },
  { labelKey: 'management.kpi.escalations', value: 5, trend: '+3', tone: 'purple', icon: Siren, query: 'escalation' },
]

const decisionRows: DecisionRow[] = [
  {
    requirementKey: 'management.req.alihKelolaTelkomSolution',
    dependencyKey: 'management.dependency.legalContract',
    requestedDecisionKey: 'management.decision.approveTransfer',
    executiveOwner: 'CEM / IBP',
    deadline: '4 Jun 2026',
    status: 'pending',
    detailSlug: 'alih-kelola-telkom-solution',
    priority: 'high',
    requestingUnit: 'Enterprise',
    internalItOwner: 'CEM',
    initiative: 'Alih Kelola Aplikasi',
    riskLevel: 'critical',
  },
  {
    requirementKey: 'management.req.drBapl',
    dependencyKey: 'management.dependency.drSite',
    requestedDecisionKey: 'management.decision.replacementScope',
    executiveOwner: 'ESS / SDA / IBP',
    deadline: '7 Jun 2026',
    status: 'inReview',
    detailSlug: 'dr-bapl',
    priority: 'high',
    requestingUnit: 'Enterprise',
    internalItOwner: 'ESS',
    initiative: 'Governance & Compliance',
    riskLevel: 'high',
  },
  {
    requirementKey: 'management.req.travisB2bItsm',
    dependencyKey: 'management.dependency.budgetApproval',
    requestedDecisionKey: 'management.decision.targetPlatform',
    executiveOwner: 'CEM / DIT',
    deadline: '15 Jun 2026',
    status: 'pending',
    detailSlug: 'travis-b2b-itsm',
    priority: 'medium',
    requestingUnit: 'Wholesale',
    internalItOwner: 'CEM',
    initiative: 'B2B Digital Enablement',
    riskLevel: 'high',
  },
  {
    requirementKey: 'management.req.smartCapex',
    dependencyKey: 'management.dependency.retirementPlan',
    requestedDecisionKey: 'management.decision.validateMigration',
    executiveOwner: 'Access / IBP',
    deadline: '10 Jun 2026',
    status: 'escalated',
    detailSlug: 'smart-capex',
    priority: 'medium',
    requestingUnit: 'Finance',
    internalItOwner: 'SDA',
    initiative: 'Application Rationalization',
    riskLevel: 'critical',
  },
  {
    requirementKey: 'management.req.brand360MyJobs',
    dependencyKey: 'management.dependency.vendorCapacity',
    requestedDecisionKey: 'management.decision.phasedRollout',
    executiveOwner: 'HCM / IBP',
    deadline: '12 Jun 2026',
    status: 'awaitingConfirmation',
    detailSlug: 'brand360-myjobs',
    priority: 'medium',
    requestingUnit: 'HCM',
    internalItOwner: 'ADM',
    initiative: 'BRM Process Improvement',
    riskLevel: 'medium',
  },
]

const agingAnalysis = [
  { labelKey: 'management.aging.bucket.0_7', count: 4, color: '#10b981' },
  { labelKey: 'management.aging.bucket.8_14', count: 5, color: '#22c55e' },
  { labelKey: 'management.aging.bucket.15_30', count: 8, color: '#f59e0b' },
  { labelKey: 'management.aging.bucket.31_60', count: 6, color: '#f97316' },
  { labelKey: 'management.aging.bucket.gt60', count: 2, color: '#ef4444' },
] satisfies { labelKey: TranslationKey; count: number; color: string }[]

const agingRequirements: AgingRequirement[] = [
  { requirementKey: 'management.req.wmsLiteLowBandwidth', age: 62, stageKey: 'management.stage.testing', internalItOwner: 'WMS', riskLevel: 'high', detailSlug: 'wms-lite-low-bandwidth' },
  { requirementKey: 'management.req.updateBisproWmsHotel', age: 48, stageKey: 'management.stage.design', internalItOwner: 'WMS', riskLevel: 'high', detailSlug: 'update-bispro-wms-hotel' },
  { requirementKey: 'management.req.alihKelolaTelkomSolution', age: 37, stageKey: 'management.stage.negotiation', internalItOwner: 'CEM', riskLevel: 'high', detailSlug: 'alih-kelola-telkom-solution' },
  { requirementKey: 'management.req.drBast', age: 22, stageKey: 'management.stage.planning', internalItOwner: 'SDA', riskLevel: 'medium', detailSlug: 'dr-bast' },
  { requirementKey: 'management.req.travisB2bItsm', age: 18, stageKey: 'management.stage.analysis', internalItOwner: 'CEM', riskLevel: 'medium', detailSlug: 'travis-b2b-itsm' },
]

const blockedDependencies = [
  { requirementKey: 'management.req.drBapl', reasonKey: 'management.blocked.drBapl', detailSlug: 'dr-bapl' },
  { requirementKey: 'management.req.smartCapex', reasonKey: 'management.blocked.smartCapex', detailSlug: 'smart-capex' },
  { requirementKey: 'management.req.wmsLiteLowBandwidth', reasonKey: 'management.blocked.wmsLite', detailSlug: 'wms-lite-low-bandwidth' },
  { requirementKey: 'management.req.brand360MyJobs', reasonKey: 'management.blocked.brand360', detailSlug: 'brand360-myjobs' },
] satisfies { requirementKey: TranslationKey; reasonKey: TranslationKey; detailSlug: string }[]

const overdueRows = [
  { requirementKey: 'management.req.alihKelolaTelkomSolution', dueDate: '4 Jun 2026', executiveOwner: 'CM', urgency: 'critical', detailSlug: 'alih-kelola-telkom-solution' },
  { requirementKey: 'management.req.drBapl', dueDate: '7 Jun 2026', executiveOwner: 'ES', urgency: 'high', detailSlug: 'dr-bapl' },
  { requirementKey: 'management.req.travisB2bItsm', dueDate: '15 Jun 2026', executiveOwner: 'CD', urgency: 'high', detailSlug: 'travis-b2b-itsm' },
] satisfies { requirementKey: TranslationKey; dueDate: string; executiveOwner: string; urgency: RiskLevel; detailSlug: string }[]

const heatmapRisks = [
  { labelKey: 'management.heatmap.ownershipDelay', impact: 'high', probability: 'high', tone: 'red' },
  { labelKey: 'management.heatmap.budgetApproval', impact: 'high', probability: 'medium', tone: 'orange' },
  { labelKey: 'management.heatmap.vendorDependency', impact: 'medium', probability: 'medium', tone: 'purple' },
  { labelKey: 'management.heatmap.scopeChange', impact: 'medium', probability: 'high', tone: 'orange' },
  { labelKey: 'management.heatmap.capacityBottleneck', impact: 'low', probability: 'low', tone: 'green' },
] satisfies { labelKey: TranslationKey; impact: HeatmapImpact; probability: HeatmapProbability; tone: Tone }[]

const filters = [
  { key: 'priority', labelKey: 'filter.priority', options: ['all', 'high', 'medium'] },
  { key: 'requestingUnit', labelKey: 'filter.requestingUnit', options: ['all', 'Enterprise', 'Wholesale', 'HCM', 'Finance', 'Consumer'] },
  { key: 'internalItOwner', labelKey: 'filter.internalItOwner', options: ['all', 'CEM', 'ESS', 'SDA', 'ADM', 'WMS'] },
  { key: 'executiveOwner', labelKey: 'filter.executiveOwner', options: ['all', 'CEM / IBP', 'ESS / SDA / IBP', 'CEM / DIT', 'Access / IBP', 'HCM / IBP'] },
  { key: 'initiative', labelKey: 'filter.initiative', options: ['all', 'Alih Kelola Aplikasi', 'B2B Digital Enablement', 'Application Rationalization', 'Governance & Compliance', 'BRM Process Improvement'] },
  { key: 'status', labelKey: 'filter.status', options: ['all', 'pending', 'inReview', 'escalated', 'awaitingConfirmation'] },
  { key: 'riskLevel', labelKey: 'filter.riskLevel', options: ['all', 'critical', 'high', 'medium'] },
] as const

function toneClasses(tone: Tone) {
  const map: Record<Tone, string> = {
    red: 'bg-red-50 text-red-700 ring-red-200',
    orange: 'bg-orange-50 text-orange-700 ring-orange-200',
    purple: 'bg-violet-50 text-violet-700 ring-violet-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 ring-amber-200',
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
    yellow: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-50 text-slate-600',
  }
  return map[tone]
}

function statusTone(status: DecisionStatus): Tone {
  const map: Record<DecisionStatus, Tone> = {
    pending: 'orange',
    inReview: 'blue',
    escalated: 'red',
    awaitingConfirmation: 'purple',
  }
  return map[status]
}

function riskTone(risk: RiskLevel): Tone {
  const map: Record<RiskLevel, Tone> = {
    critical: 'red',
    high: 'red',
    medium: 'yellow',
    low: 'green',
  }
  return map[risk]
}

function ageTone(age: number): Tone {
  if (age > 45) return 'red'
  if (age >= 31) return 'orange'
  if (age >= 15) return 'yellow'
  return 'green'
}

function CardShell({
  title,
  subtitle,
  icon,
  action,
  children,
  className,
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.05)]', className)}>
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
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
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function StatusPill({ status }: { status: DecisionStatus }) {
  const { t } = useI18n()
  const labelKey: Record<DecisionStatus, TranslationKey> = {
    pending: 'status.pending',
    inReview: 'status.inReview',
    escalated: 'status.escalated',
    awaitingConfirmation: 'status.awaitingConfirmation',
  }
  return (
    <span className={cn('inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ring-1', toneClasses(statusTone(status)))}>
      {t(labelKey[status])}
    </span>
  )
}

function RiskPill({ risk }: { risk: RiskLevel }) {
  const { t } = useI18n()
  const labelKey: Record<RiskLevel, TranslationKey> = {
    critical: 'riskLevel.critical',
    high: 'riskLevel.high',
    medium: 'riskLevel.medium',
    low: 'riskLevel.low',
  }
  return (
    <span className={cn('inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ring-1', toneClasses(riskTone(risk)))}>
      {t(labelKey[risk])}
    </span>
  )
}

function FilterPanel() {
  const { t } = useI18n()
  const [selected, setSelected] = useState<Record<string, string>>({
    priority: 'all',
    requestingUnit: 'all',
    internalItOwner: 'all',
    executiveOwner: 'all',
    initiative: 'all',
    status: 'all',
    riskLevel: 'all',
  })

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-slate-800">
        <SlidersHorizontal size={15} className="text-violet-600" />
        {t('filter.managementFilters')}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {filters.map((filter) => (
          <label key={filter.key} className="block">
            <span className="mb-1 block text-[11px] font-medium text-slate-500">{t(filter.labelKey)}</span>
            <select
              value={selected[filter.key]}
              onChange={(event) => setSelected((current) => ({ ...current, [filter.key]: event.target.value }))}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-[12px] font-medium text-slate-700 outline-none transition-colors focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
            >
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {optionLabel(option, t)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  )
}

function optionLabel(option: string, t: (key: TranslationKey) => string) {
  const optionMap: Record<string, TranslationKey> = {
    all: 'filter.all',
    high: 'priority.high',
    medium: 'priority.medium',
    pending: 'status.pending',
    inReview: 'status.inReview',
    escalated: 'status.escalated',
    awaitingConfirmation: 'status.awaitingConfirmation',
    critical: 'riskLevel.critical',
  }
  return optionMap[option] ? t(optionMap[option]) : option
}

function KpiCard({ item }: { item: AttentionKpi }) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={() => navigate(`/requirements?search=${encodeURIComponent(item.query)}`)}
      className="group rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_14px_32px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_20px_44px_rgba(79,70,229,0.12)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconToneClasses(item.tone))}>
          <Icon size={19} />
        </div>
        <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1', toneClasses(item.tone))}>
          {item.trend} {t('kpi.trend.vsLastMonth')}
        </span>
      </div>
      <p className="mt-4 text-[12px] font-medium text-slate-500">{t(item.labelKey)}</p>
      <p className="mt-1 text-[30px] font-semibold tracking-tight text-slate-950">{item.value}</p>
    </button>
  )
}

function DecisionTracker() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <CardShell
      title={t('management.section.decisionTracker')}
      subtitle={t('management.section.decisionTracker.subtitle')}
      icon={<Scale size={17} />}
      action={
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-violet-700 transition-colors hover:bg-violet-50"
        >
          {t('button.viewAllDecisions')}
          <ArrowRight size={13} />
        </button>
      }
      className="overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] table-fixed border-separate border-spacing-0 text-left">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[24%]" />
            <col className="w-[13%]" />
            <col className="w-[12%]" />
            <col className="w-[15%]" />
          </colgroup>
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.08em] text-slate-400">
              <th className="pb-3 font-semibold">{t('table.requirement')}</th>
              <th className="pb-3 font-semibold">{t('table.keyDependency')}</th>
              <th className="pb-3 font-semibold">{t('table.requestedDecision')}</th>
              <th className="pb-3 font-semibold">{t('table.executiveOwner')}</th>
              <th className="pb-3 font-semibold">{t('table.deadline')}</th>
              <th className="pb-3 text-right font-semibold">{t('table.status')}</th>
            </tr>
          </thead>
          <tbody>
            {decisionRows.map((row) => (
              <tr
                key={row.requirementKey}
                onClick={() => navigate(`/requirements/detail/${row.detailSlug}`)}
                className="group cursor-pointer text-[13px] text-slate-700"
              >
                <td className="border-t border-slate-100 py-3.5 pr-4 font-semibold leading-snug text-slate-950 group-hover:text-violet-700">
                  {t(row.requirementKey)}
                </td>
                <td className="border-t border-slate-100 py-3.5 pr-4 leading-snug">{t(row.dependencyKey)}</td>
                <td className="border-t border-slate-100 py-3.5 pr-4 leading-snug text-slate-900">{t(row.requestedDecisionKey)}</td>
                <td className="border-t border-slate-100 py-3.5 pr-4">
                  <span className="rounded-full bg-slate-50 px-2 py-1 text-[12px] font-medium text-slate-600 ring-1 ring-slate-200">
                    {row.executiveOwner}
                  </span>
                </td>
                <td className="border-t border-slate-100 py-3.5 pr-4 font-medium leading-snug text-slate-700">{row.deadline}</td>
                <td className="border-t border-slate-100 py-3.5 text-right">
                  <StatusPill status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  )
}

function AgingAnalysisCard() {
  const { t } = useI18n()
  const max = Math.max(...agingAnalysis.map((item) => item.count))

  return (
    <CardShell title={t('management.section.agingAnalysis')} subtitle={t('management.section.agingAnalysis.subtitle')} icon={<Hourglass size={17} />}>
      <div className="space-y-4">
        {agingAnalysis.map((item) => (
          <div key={item.labelKey}>
            <div className="mb-1.5 flex items-center justify-between text-[12px]">
              <span className="font-medium text-slate-600">{t(item.labelKey)}</span>
              <span className="font-semibold text-slate-950">{item.count}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full shadow-sm"
                style={{ width: `${(item.count / max) * 100}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  )
}

function TopAgingRequirements() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <CardShell title={t('management.section.topAgingRequirements')} icon={<Clock3 size={17} />} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0 text-left">
          <colgroup>
            <col className="w-[36%]" />
            <col className="w-[16%]" />
            <col className="w-[19%]" />
            <col className="w-[16%]" />
            <col className="w-[13%]" />
          </colgroup>
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.08em] text-slate-400">
              <th className="pb-3 pr-2 font-semibold leading-tight">{t('table.requirement')}</th>
              <th className="pb-3 pr-2 font-semibold leading-tight">{t('table.age')}</th>
              <th className="pb-3 pr-2 font-semibold leading-tight">{t('table.currentStage')}</th>
              <th className="pb-3 pr-2 font-semibold leading-tight">{t('table.internalItOwner')}</th>
              <th className="pb-3 text-right font-semibold leading-tight">{t('table.risk')}</th>
            </tr>
          </thead>
          <tbody>
            {agingRequirements.map((row) => (
              <tr
                key={row.requirementKey}
                onClick={() => navigate(`/requirements/detail/${row.detailSlug}`)}
                className="group cursor-pointer text-[13px] text-slate-700"
              >
                <td className="border-t border-slate-100 py-3 pr-3 font-semibold leading-snug text-slate-950 group-hover:text-violet-700">{t(row.requirementKey)}</td>
                <td className="border-t border-slate-100 py-3 pr-3">
                  <span className={cn('rounded-full px-2 py-1 text-[11px] font-semibold ring-1', toneClasses(ageTone(row.age)))}>
                    {row.age} {t('unit.days')}
                  </span>
                </td>
                <td className="border-t border-slate-100 py-3 pr-3">{t(row.stageKey)}</td>
                <td className="border-t border-slate-100 py-3 pr-3">
                  <span className="rounded-full bg-slate-50 px-2 py-1 text-[12px] font-medium text-slate-600 ring-1 ring-slate-200">
                    {row.internalItOwner}
                  </span>
                </td>
                <td className="border-t border-slate-100 py-3 text-right">
                  <RiskPill risk={row.riskLevel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  )
}

function BlockedDependenciesCard() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <CardShell title={t('management.section.blockedDependencies')} icon={<Ban size={17} />}>
      <div className="space-y-3">
        {blockedDependencies.map((item) => (
          <button
            key={item.requirementKey}
            type="button"
            onClick={() => navigate(`/requirements/detail/${item.detailSlug}`)}
            className="group flex w-full items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-left transition-colors hover:border-red-200 hover:bg-red-50/60"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 ring-1 ring-red-100">
              <Ban size={17} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-slate-950 group-hover:text-red-700">{t(item.requirementKey)}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{t(item.reasonKey)}</p>
            </div>
          </button>
        ))}
      </div>
    </CardShell>
  )
}

function HighPriorityOverdueCard() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <CardShell title={t('management.section.highPriorityOverdue')} icon={<Flame size={17} />} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0 text-left">
          <colgroup>
            <col className="w-[38%]" />
            <col className="w-[22%]" />
            <col className="w-[20%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.08em] text-slate-400">
              <th className="pb-3 pr-2 font-semibold leading-tight">{t('table.requirement')}</th>
              <th className="pb-3 pr-2 font-semibold leading-tight">{t('table.dueDate')}</th>
              <th className="pb-3 pr-2 font-semibold leading-tight">{t('table.executiveOwner')}</th>
              <th className="pb-3 text-right font-semibold leading-tight">{t('table.urgency')}</th>
            </tr>
          </thead>
          <tbody>
            {overdueRows.map((row) => (
              <tr
                key={row.requirementKey}
                onClick={() => navigate(`/requirements/detail/${row.detailSlug}`)}
                className="group cursor-pointer text-[13px] text-slate-700"
              >
                <td className="border-t border-slate-100 py-3 pr-3 font-semibold leading-snug text-slate-950 group-hover:text-violet-700">{t(row.requirementKey)}</td>
                <td className="border-t border-slate-100 py-3 pr-3 font-medium leading-snug text-slate-700">{row.dueDate}</td>
                <td className="border-t border-slate-100 py-3 pr-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 text-[11px] font-bold text-violet-700 ring-1 ring-violet-200">
                    {row.executiveOwner}
                  </span>
                </td>
                <td className="border-t border-slate-100 py-3 text-right">
                  <RiskPill risk={row.urgency} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  )
}

function RiskHeatmapCard() {
  const { t } = useI18n()
  const impacts: HeatmapImpact[] = ['high', 'medium', 'low']
  const probabilities: HeatmapProbability[] = ['low', 'medium', 'high']
  const axisKey: Record<HeatmapImpact | HeatmapProbability, TranslationKey> = {
    low: 'axis.low',
    medium: 'axis.medium',
    high: 'axis.high',
  }

  const risksByCell = useMemo(() => {
    return heatmapRisks.reduce((acc, risk) => {
      const key = `${risk.impact}:${risk.probability}`
      acc[key] = [...(acc[key] ?? []), risk]
      return acc
    }, {} as Record<string, typeof heatmapRisks>)
  }, [])

  return (
    <CardShell title={t('management.section.riskHeatmap')} icon={<ShieldAlert size={17} />}>
      <div className="grid grid-cols-[72px_1fr] gap-3">
        <div className="flex items-center justify-center">
          <div className="-rotate-90 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {t('axis.impact')}
          </div>
        </div>
        <div>
          <div className="grid grid-cols-3 gap-2 pb-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {probabilities.map((probability) => <span key={probability}>{t(axisKey[probability])}</span>)}
          </div>
          <div className="grid grid-cols-[64px_1fr] gap-2">
            <div className="grid grid-rows-3 gap-2 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              {impacts.map((impact) => <div key={impact} className="flex items-center justify-end">{t(axisKey[impact])}</div>)}
            </div>
            <div className="grid grid-cols-3 grid-rows-3 gap-2">
              {impacts.map((impact) => probabilities.map((probability) => {
                const cellRisks = risksByCell[`${impact}:${probability}`] ?? []
                const danger = impact === 'high' && probability === 'high'
                  ? 'bg-red-50 ring-red-100'
                  : impact === 'high' || probability === 'high'
                    ? 'bg-orange-50 ring-orange-100'
                    : impact === 'medium' || probability === 'medium'
                      ? 'bg-violet-50 ring-violet-100'
                      : 'bg-emerald-50 ring-emerald-100'
                return (
                  <div key={`${impact}-${probability}`} className={cn('min-h-[88px] rounded-xl p-2 ring-1', danger)}>
                    <div className="space-y-1.5">
                      {cellRisks.map((risk) => (
                        <span
                          key={risk.labelKey}
                          className={cn('inline-flex max-w-full rounded-full px-2 py-1 text-[11px] font-semibold ring-1', toneClasses(risk.tone))}
                        >
                          <span className="truncate">{t(risk.labelKey)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )
              }))}
            </div>
          </div>
          <div className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {t('axis.probability')}
          </div>
        </div>
      </div>
    </CardShell>
  )
}

export default function ManagementAttentionPage() {
  const { t } = useI18n()

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[12px] font-semibold text-red-700">
            <Siren size={13} />
            {t('management.eyebrow')}
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-slate-950">{t('page.managementAttention.title')}</h1>
          <p className="mt-1 text-[14px] text-slate-500">{t('page.managementAttention.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-500 shadow-sm">
          <Filter size={15} className="text-violet-500" />
          <span>{t('filter.supports')}</span>
          <span className="font-semibold text-slate-950">{filters.length}</span>
        </div>
      </div>

      <FilterPanel />

      <section aria-label={t('management.section.attentionKpis')} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => <KpiCard key={item.labelKey} item={item} />)}
      </section>

      <DecisionTracker />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <AgingAnalysisCard />
        <TopAgingRequirements />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <BlockedDependenciesCard />
        <HighPriorityOverdueCard />
      </div>

      <RiskHeatmapCard />

      <div className="rounded-2xl border border-violet-200 bg-violet-50/70 px-4 py-3 text-[12px] leading-relaxed text-violet-800">
        <span className="font-semibold">{t('note.managementScope')}</span> {t('note.managementScope.description')}
      </div>
    </div>
  )
}
