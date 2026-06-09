import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AppWindow,
  ArrowRight,
  BarChart3,
  Blocks,
  Building2,
  CheckCircle2,
  CircleDot,
  Clock3,
  GitBranch,
  Gauge,
  Layers3,
  Network,
  PieChart as PieChartIcon,
  Sparkles,
  Target,
  TimerReset,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils'
import { useI18n, type TranslationKey } from '@/i18n'

type Tone = 'red' | 'orange' | 'purple' | 'blue' | 'green' | 'teal' | 'slate'
type PortfolioStatus = 'ownershipTransfer' | 'assessment' | 'planning' | 'retirementCandidate' | 'completed'
type RiskLevel = 'high' | 'medium' | 'low'

interface PortfolioKpi {
  labelKey: TranslationKey
  value?: string
  valueKey?: TranslationKey
  suffixKey?: TranslationKey
  trend: string
  trendSuffixKey?: TranslationKey
  trendKey?: TranslationKey
  tone: Tone
  icon: LucideIcon
  href: string
}

interface PipelineStage {
  labelKey: TranslationKey
  shortKey: TranslationKey
  count: number
  tone: Tone
  query: string
  isBottleneck?: boolean
  isCompleted?: boolean
}

interface GovernanceRow {
  applicationKey: TranslationKey
  currentOwner: string
  targetOwner: string
  status: PortfolioStatus
  nextStepKey: TranslationKey
  risk: RiskLevel
  slug: string
}

const portfolioKpis: PortfolioKpi[] = [
  {
    labelKey: 'portfolio.kpi.totalInitiatives',
    value: '15',
    trend: '+15%',
    trendSuffixKey: 'kpi.trend.vsLastMonth',
    tone: 'purple',
    icon: Layers3,
    href: '/requirements?group=initiative',
  },
  {
    labelKey: 'portfolio.kpi.activeAlihKelolaApps',
    value: '6',
    suffixKey: 'unit.apps',
    trend: '+20%',
    trendSuffixKey: 'kpi.trend.vsLastMonth',
    tone: 'blue',
    icon: AppWindow,
    href: '/governance/alih-kelola',
  },
  {
    labelKey: 'portfolio.kpi.pipelineBottleneck',
    valueKey: 'portfolio.stage.development',
    trend: '',
    trendKey: 'portfolio.badge.bottleneck',
    tone: 'orange',
    icon: GitBranch,
    href: '/requirements?stage=development',
  },
  {
    labelKey: 'portfolio.kpi.avgAssessmentTime',
    value: '18',
    suffixKey: 'unit.days',
    trend: '-8%',
    trendSuffixKey: 'kpi.trend.vsLastMonth',
    tone: 'green',
    icon: TimerReset,
    href: '/requirements?stage=assessment',
  },
]

const pipelineStages: PipelineStage[] = [
  { labelKey: 'portfolio.stage.intake', shortKey: 'portfolio.stage.intake', count: 3, tone: 'purple', query: 'intake' },
  { labelKey: 'portfolio.stage.requirementGathering', shortKey: 'portfolio.stage.gatheringShort', count: 2, tone: 'blue', query: 'requirement-gathering' },
  { labelKey: 'portfolio.stage.assessment', shortKey: 'portfolio.stage.assessment', count: 4, tone: 'teal', query: 'assessment' },
  { labelKey: 'portfolio.stage.development', shortKey: 'portfolio.stage.development', count: 10, tone: 'orange', query: 'development', isBottleneck: true },
  { labelKey: 'portfolio.stage.uat', shortKey: 'portfolio.stage.uat', count: 3, tone: 'purple', query: 'uat' },
  { labelKey: 'portfolio.stage.d2p', shortKey: 'portfolio.stage.d2p', count: 1, tone: 'blue', query: 'd2p' },
  { labelKey: 'portfolio.stage.completed', shortKey: 'portfolio.stage.completed', count: 2, tone: 'green', query: 'completed', isCompleted: true },
]

const stageAging = [
  { labelKey: 'portfolio.stage.intake', days: 5, color: '#8b5cf6' },
  { labelKey: 'portfolio.stage.gatheringShort', days: 12, color: '#3b82f6' },
  { labelKey: 'portfolio.stage.assessment', days: 18, color: '#14b8a6' },
  { labelKey: 'portfolio.stage.development', days: 24, color: '#f97316', highlight: true },
  { labelKey: 'portfolio.stage.uat', days: 15, color: '#7c3aed' },
  { labelKey: 'portfolio.stage.d2p', days: 7, color: '#6366f1' },
] satisfies { labelKey: TranslationKey; days: number; color: string; highlight?: boolean }[]

const governanceRows: GovernanceRow[] = [
  {
    applicationKey: 'portfolio.app.telkomSolution',
    currentOwner: 'EMRM',
    targetOwner: 'CEM',
    status: 'ownershipTransfer',
    nextStepKey: 'portfolio.nextStep.ownershipConfirmation',
    risk: 'medium',
    slug: 'telkom-solution',
  },
  {
    applicationKey: 'portfolio.app.brand360',
    currentOwner: 'EMRM',
    targetOwner: 'CEM',
    status: 'assessment',
    nextStepKey: 'portfolio.nextStep.scopeAssessment',
    risk: 'medium',
    slug: 'brand360',
  },
  {
    applicationKey: 'portfolio.app.myJobs',
    currentOwner: 'EMRM',
    targetOwner: 'CEM',
    status: 'assessment',
    nextStepKey: 'portfolio.nextStep.businessAssessment',
    risk: 'medium',
    slug: 'myjobs',
  },
  {
    applicationKey: 'portfolio.app.drBast',
    currentOwner: 'SDA',
    targetOwner: 'SMILE Adv / ESS',
    status: 'planning',
    nextStepKey: 'portfolio.nextStep.defineMigrationPlan',
    risk: 'high',
    slug: 'dr-bast',
  },
  {
    applicationKey: 'portfolio.app.drOblKl',
    currentOwner: 'SDA',
    targetOwner: 'SMILE Adv / ESS',
    status: 'planning',
    nextStepKey: 'portfolio.nextStep.stakeholderAlignment',
    risk: 'high',
    slug: 'dr-obl-kl',
  },
  {
    applicationKey: 'portfolio.app.smartCapex',
    currentOwner: 'Existing App',
    targetOwner: 'SMILE Adv',
    status: 'retirementCandidate',
    nextStepKey: 'portfolio.nextStep.validateStakeholders',
    risk: 'high',
    slug: 'smart-capex',
  },
]

const businessImpactMix = [
  { labelKey: 'portfolio.impact.revenueSupport', count: 5, color: '#6d5dfc' },
  { labelKey: 'portfolio.impact.operationalContinuity', count: 7, color: '#14b8a6' },
  { labelKey: 'portfolio.impact.complianceRisk', count: 4, color: '#f59e0b' },
  { labelKey: 'portfolio.impact.costEfficiency', count: 3, color: '#3b82f6' },
  { labelKey: 'portfolio.impact.appRationalization', count: 6, color: '#ef4444' },
] satisfies { labelKey: TranslationKey; count: number; color: string }[]

const portfolioInitiatives = [
  { labelKey: 'portfolio.initiative.alihKelolaAplikasi', count: 8, color: '#6d5dfc', query: 'Alih Kelola Aplikasi' },
  { labelKey: 'portfolio.initiative.b2bDigitalEnablement', count: 6, color: '#14b8a6', query: 'B2B Digital Enablement' },
  { labelKey: 'portfolio.initiative.applicationRationalization', count: 5, color: '#3b82f6', query: 'Application Rationalization' },
  { labelKey: 'portfolio.initiative.governanceCompliance', count: 4, color: '#f59e0b', query: 'Governance & Compliance' },
  { labelKey: 'portfolio.initiative.brmProcessImprovement', count: 2, color: '#8b5cf6', query: 'BRM Process Improvement' },
] satisfies { labelKey: TranslationKey; count: number; color: string; query: string }[]

const requestingUnitMix = [
  { labelKey: 'requestingUnit.enterprise', count: 8, color: '#6d5dfc', query: 'Enterprise' },
  { labelKey: 'requestingUnit.wholesale', count: 5, color: '#14b8a6', query: 'Wholesale' },
  { labelKey: 'requestingUnit.hcm', count: 4, color: '#3b82f6', query: 'HCM' },
  { labelKey: 'requestingUnit.finance', count: 3, color: '#f59e0b', query: 'Finance' },
  { labelKey: 'requestingUnit.consumer', count: 5, color: '#8b5cf6', query: 'Consumer' },
] satisfies { labelKey: TranslationKey; count: number; color: string; query: string }[]

const insightKeys: TranslationKey[] = [
  'portfolio.insight.developmentBottleneck',
  'portfolio.insight.ownershipConfirmation',
  'portfolio.insight.rationalizationValidation',
  'portfolio.insight.enterpriseConsumerDemand',
]

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

function gradientClasses(tone: Tone, isHighlighted?: boolean) {
  if (isHighlighted) return 'from-orange-500 to-red-500 text-white shadow-orange-500/20 ring-orange-200'
  const map: Record<Tone, string> = {
    red: 'from-red-500 to-rose-500 text-white shadow-red-500/20 ring-red-200',
    orange: 'from-orange-500 to-amber-500 text-white shadow-orange-500/20 ring-orange-200',
    purple: 'from-violet-600 to-indigo-600 text-white shadow-violet-500/20 ring-violet-200',
    blue: 'from-blue-500 to-indigo-500 text-white shadow-blue-500/20 ring-blue-200',
    green: 'from-emerald-500 to-teal-500 text-white shadow-emerald-500/20 ring-emerald-200',
    teal: 'from-teal-500 to-cyan-500 text-white shadow-teal-500/20 ring-teal-200',
    slate: 'from-slate-500 to-slate-600 text-white shadow-slate-500/20 ring-slate-200',
  }
  return map[tone]
}

function statusTone(status: PortfolioStatus): Tone {
  const map: Record<PortfolioStatus, Tone> = {
    ownershipTransfer: 'purple',
    assessment: 'blue',
    planning: 'orange',
    retirementCandidate: 'red',
    completed: 'green',
  }
  return map[status]
}

function riskTone(risk: RiskLevel): Tone {
  const map: Record<RiskLevel, Tone> = {
    high: 'red',
    medium: 'orange',
    low: 'green',
  }
  return map[risk]
}

function statusLabelKey(status: PortfolioStatus): TranslationKey {
  const map: Record<PortfolioStatus, TranslationKey> = {
    ownershipTransfer: 'status.ownershipTransfer',
    assessment: 'status.assessment',
    planning: 'status.planning',
    retirementCandidate: 'status.retirementCandidate',
    completed: 'status.completed',
  }
  return map[status]
}

function riskLabelKey(risk: RiskLevel): TranslationKey {
  const map: Record<RiskLevel, TranslationKey> = {
    high: 'riskLevel.high',
    medium: 'riskLevel.medium',
    low: 'riskLevel.low',
  }
  return map[risk]
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
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
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

function ChartTooltip({ active, payload, label }: any) {
  const { t } = useI18n()
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] shadow-xl shadow-slate-900/10">
      {label && <p className="mb-1 font-semibold text-slate-700">{label}</p>}
      {payload.map((item: any) => (
        <p key={`${item.name}-${item.value}`} className="font-medium" style={{ color: item.fill || item.payload?.color || item.stroke }}>
          {item.value} {item.dataKey === 'days' ? t('unit.days') : t('unit.items')}
        </p>
      ))}
    </div>
  )
}

function StatusPill({ status }: { status: PortfolioStatus }) {
  const { t } = useI18n()
  return (
    <span className={cn('inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ring-1', toneClasses(statusTone(status)))}>
      {t(statusLabelKey(status))}
    </span>
  )
}

function RiskPill({ risk }: { risk: RiskLevel }) {
  const { t } = useI18n()
  return (
    <span className={cn('inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ring-1', toneClasses(riskTone(risk)))}>
      {t(riskLabelKey(risk))}
    </span>
  )
}

function KpiCard({ item }: { item: PortfolioKpi }) {
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
          {item.trendKey ? t(item.trendKey) : item.trend}
          {item.trendSuffixKey && <span className="ml-1 hidden xl:inline">{t(item.trendSuffixKey)}</span>}
        </span>
      </div>
      <p className="mt-4 text-[12px] font-medium text-slate-500">{t(item.labelKey)}</p>
      <p className="mt-1 text-[27px] font-semibold tracking-tight text-slate-950">
        {item.valueKey ? t(item.valueKey) : item.value}
        {item.suffixKey && <><span> </span><span className="inline-block text-[16px] font-semibold text-slate-500">{t(item.suffixKey)}</span></>}
      </p>
    </button>
  )
}

function RequirementPipelineCard() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const total = pipelineStages.reduce((sum, stage) => sum + stage.count, 0)

  return (
    <CardShell
      title={t('portfolio.section.requirementPipeline')}
      subtitle={`${t('portfolio.label.totalInPipeline')}: ${total}`}
      icon={<Network size={17} />}
      className="overflow-hidden"
    >
      <div className="overflow-x-auto pb-1">
        <div className="grid min-w-[860px] grid-cols-7 gap-2">
          {pipelineStages.map((stage, index) => (
            <div key={stage.labelKey} className="relative">
              <button
                type="button"
                onClick={() => navigate(`/requirements?stage=${encodeURIComponent(stage.query)}`)}
                className={cn(
                  'group relative flex min-h-[148px] w-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-3.5 text-left shadow-lg ring-1 transition-transform duration-200 hover:-translate-y-0.5',
                  gradientClasses(stage.tone, stage.isBottleneck),
                )}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/15" />
                <div>
                  <div className="flex flex-wrap items-start gap-1">
                    <span className="rounded-full bg-white/16 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/85 ring-1 ring-white/20">
                      {stage.isCompleted ? t('status.completed') : t('status.open')}
                    </span>
                    {stage.isBottleneck && (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-orange-700">
                        {t('portfolio.badge.bottleneck')}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-[12px] font-semibold leading-tight text-white/90">{t(stage.labelKey)}</p>
                  <p className="mt-1 text-[32px] font-semibold tracking-tight">{stage.count}</p>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-white/75">
                    <span>{t('portfolio.label.stageShare')}</span>
                    <span>{Math.round((stage.count / total) * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/20">
                    <div className="h-2 rounded-full bg-white/80" style={{ width: `${(stage.count / total) * 100}%` }} />
                  </div>
                </div>
              </button>
              {index < pipelineStages.length - 1 && (
                <ArrowRight size={16} className={cn('pointer-events-none absolute -right-3.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white text-slate-300 shadow-sm ring-1 ring-slate-100', stage.isBottleneck && 'text-orange-400')} />
              )}
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  )
}

function StageAgingCard() {
  const { t } = useI18n()
  const chartData = useMemo(
    () => stageAging.map((item) => ({ ...item, name: t(item.labelKey) })),
    [t],
  )

  return (
    <CardShell title={t('portfolio.section.stageAging')} subtitle={t('portfolio.section.stageAging.subtitle')} icon={<Clock3 size={17} />}>
      <div className="h-[290px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" width={86} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="days" radius={[0, 8, 8, 0]} barSize={18} isAnimationActive={false}>
              {chartData.map((item) => (
                <Cell key={item.labelKey} fill={item.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 rounded-xl bg-orange-50 px-3 py-2 text-[12px] font-medium leading-relaxed text-orange-700 ring-1 ring-orange-100">
        {t('portfolio.note.longestAging')}
      </div>
    </CardShell>
  )
}

function GovernanceTableCard() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <CardShell title={t('portfolio.section.alihKelolaGovernance')} icon={<Building2 size={17} />} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] table-fixed border-separate border-spacing-0 text-left">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[20%]" />
            <col className="w-[16%]" />
            <col className="w-[20%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.08em] text-slate-400">
              <th className="pb-3 pr-3 font-semibold">{t('table.application')}</th>
              <th className="pb-3 pr-3 font-semibold">{t('table.currentApplicationOwner')}</th>
              <th className="pb-3 pr-3 font-semibold">{t('table.targetApplicationOwner')}</th>
              <th className="pb-3 pr-3 font-semibold">{t('table.status')}</th>
              <th className="pb-3 pr-3 font-semibold">{t('table.nextStep')}</th>
              <th className="pb-3 text-right font-semibold">{t('table.risk')}</th>
            </tr>
          </thead>
          <tbody>
            {governanceRows.map((row) => (
              <tr
                key={row.applicationKey}
                onClick={() => navigate(`/governance/alih-kelola?application=${encodeURIComponent(row.slug)}`)}
                className="group cursor-pointer text-[13px] text-slate-700"
              >
                <td className="border-t border-slate-100 py-3.5 pr-4 font-semibold leading-snug text-slate-950 group-hover:text-violet-700">
                  {t(row.applicationKey)}
                </td>
                <td className="border-t border-slate-100 py-3.5 pr-4">
                  <span className="rounded-full bg-slate-50 px-2 py-1 text-[12px] font-medium text-slate-600 ring-1 ring-slate-200">
                    {row.currentOwner}
                  </span>
                </td>
                <td className="border-t border-slate-100 py-3.5 pr-4">
                  <span className="rounded-full bg-violet-50 px-2 py-1 text-[12px] font-medium text-violet-700 ring-1 ring-violet-100">
                    {row.targetOwner}
                  </span>
                </td>
                <td className="border-t border-slate-100 py-3.5 pr-4">
                  <StatusPill status={row.status} />
                </td>
                <td className="border-t border-slate-100 py-3.5 pr-4 leading-snug text-slate-700">{t(row.nextStepKey)}</td>
                <td className="border-t border-slate-100 py-3.5 text-right">
                  <RiskPill risk={row.risk} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  )
}

function BusinessImpactMixCard() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const total = businessImpactMix.reduce((sum, item) => sum + item.count, 0)
  const chartData = useMemo(
    () => businessImpactMix.map((item) => ({ ...item, name: t(item.labelKey) })),
    [t],
  )

  return (
    <CardShell title={t('portfolio.section.businessImpactMix')} icon={<PieChartIcon size={17} />}>
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <div className="relative h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="count" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3} isAnimationActive={false}>
                {chartData.map((item) => (
                  <Cell key={item.labelKey} fill={item.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[30px] font-semibold tracking-tight text-slate-950">{total}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{t('portfolio.label.total')}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2 self-center">
          {businessImpactMix.map((item) => (
            <button
              key={item.labelKey}
              type="button"
              onClick={() => navigate(`/requirements?impact=${encodeURIComponent(t(item.labelKey))}`)}
              className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-left transition-colors hover:border-violet-200 hover:bg-violet-50"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate text-[12px] font-medium text-slate-700 group-hover:text-violet-700">{t(item.labelKey)}</span>
              </span>
              <span className="text-[13px] font-semibold text-slate-950">{item.count}</span>
            </button>
          ))}
        </div>
      </div>
    </CardShell>
  )
}

function PortfolioInitiativeCard() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const max = Math.max(...portfolioInitiatives.map((item) => item.count))

  return (
    <CardShell title={t('section.portfolioInitiative')} icon={<BarChart3 size={17} />}>
      <div className="space-y-4">
        {portfolioInitiatives.map((item) => (
          <button
            key={item.labelKey}
            type="button"
            onClick={() => navigate(`/requirements?initiative=${encodeURIComponent(item.query)}`)}
            className="group w-full text-left"
          >
            <div className="mb-1.5 flex items-center justify-between gap-3 text-[12px]">
              <span className="font-medium text-slate-600 group-hover:text-violet-700">{t(item.labelKey)}</span>
              <span className="font-semibold text-slate-950">{item.count}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div className="h-3 rounded-full shadow-sm transition-all group-hover:brightness-95" style={{ width: `${(item.count / max) * 100}%`, backgroundColor: item.color }} />
            </div>
          </button>
        ))}
      </div>
    </CardShell>
  )
}

function RequestingUnitMixCard() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const max = Math.max(...requestingUnitMix.map((item) => item.count))

  return (
    <CardShell title={t('portfolio.section.requestingUnitPortfolioMix')} icon={<Target size={17} />}>
      <div className="space-y-3">
        {requestingUnitMix.map((item) => (
          <button
            key={item.labelKey}
            type="button"
            onClick={() => navigate(`/requirements?requestingUnit=${encodeURIComponent(item.query)}`)}
            className="group grid w-full grid-cols-[92px_1fr_28px] items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-violet-50"
          >
            <span className="truncate text-[12px] font-medium text-slate-600 group-hover:text-violet-700">{t(item.labelKey)}</span>
            <span className="h-2.5 rounded-full bg-slate-100">
              <span className="block h-2.5 rounded-full" style={{ width: `${(item.count / max) * 100}%`, backgroundColor: item.color }} />
            </span>
            <span className="text-right text-[13px] font-semibold text-slate-950">{item.count}</span>
          </button>
        ))}
      </div>
    </CardShell>
  )
}

function PipelineInsightCard() {
  const { t } = useI18n()

  return (
    <CardShell title={t('portfolio.section.pipelineInsight')} icon={<Sparkles size={17} />}>
      <div className="space-y-3">
        {insightKeys.map((key) => (
          <div key={key} className="flex gap-3 rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
            <CircleDot size={15} className="mt-0.5 shrink-0 text-violet-600" />
            <p className="text-[13px] leading-relaxed text-slate-600">{t(key)}</p>
          </div>
        ))}
      </div>
    </CardShell>
  )
}

export default function PortfolioPipelinePage() {
  const { t } = useI18n()

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50/70 p-5 shadow-[0_18px_42px_rgba(79,70,229,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-700 ring-1 ring-violet-100">
              <Gauge size={13} />
              {t('page.portfolioPipeline.eyebrow')}
            </div>
            <h1 className="text-[28px] font-semibold tracking-tight text-slate-950">{t('page.portfolioPipeline.title')}</h1>
            <p className="mt-1 text-[14px] text-slate-500">{t('page.portfolioPipeline.subtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 ring-1 ring-slate-200">
              <Blocks size={13} className="text-violet-600" />
              {t('portfolio.label.portfolioControlRoom')}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 ring-1 ring-slate-200">
              <CheckCircle2 size={13} className="text-emerald-600" />
              25 {t('unit.items')}
            </span>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {portfolioKpis.map((item) => (
          <KpiCard key={item.labelKey} item={item} />
        ))}
      </section>

      <RequirementPipelineCard />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <StageAgingCard />
        <BusinessImpactMixCard />
      </section>

      <GovernanceTableCard />

      <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <PortfolioInitiativeCard />
        <div className="grid gap-5">
          <RequestingUnitMixCard />
          <PipelineInsightCard />
        </div>
      </section>

      <section className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4 text-[13px] leading-relaxed text-violet-900">
        <span className="font-semibold">{t('note.portfolioScope')}</span>
        <span> {t('note.portfolioScope.description')}</span>
      </section>
    </div>
  )
}
