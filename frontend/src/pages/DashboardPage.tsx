import { useNavigate } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, PolarAngleAxis,
  RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  Activity, AlertTriangle, ArrowRight, BadgeCheck, Ban, Building2,
  CalendarClock, CheckCircle2, Clock3, FileWarning, Gauge, Layers3,
  LineChart as LineChartIcon, ShieldAlert, Sparkles, Target, Timer, TrendingDown,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils'
import { useI18n, type TranslationKey } from '@/i18n'

type Tone = 'good' | 'warning' | 'bad' | 'neutral' | 'purple'

type IconType = LucideIcon

interface KpiItem {
  labelKey: TranslationKey
  value: string
  suffixKey?: TranslationKey
  trend: string
  trendTone: Tone
  icon: IconType
  href: string
}

interface AttentionItem {
  priorityKey: TranslationKey
  priorityTone: 'high' | 'medium'
  requirement: string
  issue: string
  decision: string
  executiveOwner: string
  due: string
  detailSlug: string
}

const kpiItems: KpiItem[] = [
  { labelKey: 'kpi.activeRequirements', value: '25', trend: '+4', trendTone: 'neutral', icon: Activity, href: '/requirements?status=development' },
  { labelKey: 'kpi.newThisMonth', value: '8', trend: '+12%', trendTone: 'neutral', icon: Sparkles, href: '/requirements?sort=created_at&dir=desc' },
  { labelKey: 'kpi.completedThisMonth', value: '6', trend: '+2', trendTone: 'good', icon: CheckCircle2, href: '/requirements?status=completed' },
  { labelKey: 'kpi.overdue', value: '3', trend: '-1', trendTone: 'good', icon: CalendarClock, href: '/requirements?search=overdue' },
  { labelKey: 'kpi.atRisk', value: '5', trend: '+2', trendTone: 'bad', icon: ShieldAlert, href: '/requirements?priority=critical' },
  { labelKey: 'kpi.blocked', value: '2', trend: '+1', trendTone: 'warning', icon: Ban, href: '/requirements?search=blocked' },
  { labelKey: 'kpi.avgLeadTime', value: '21', suffixKey: 'unit.days', trend: '-3d', trendTone: 'good', icon: Timer, href: '/requirements?search=lead%20time' },
  { labelKey: 'kpi.slaCompliance', value: '84%', trend: '+5%', trendTone: 'good', icon: Gauge, href: '/requirements?search=sla' },
]

const attentionItems: AttentionItem[] = [
  {
    priorityKey: 'priority.high',
    priorityTone: 'high',
    requirement: 'Alih Kelola Telkom Solution',
    issue: 'Ownership confirmation pending',
    decision: 'Approve transfer EMRM -> CEM',
    executiveOwner: 'CEM / IBP',
    due: '4 Jun',
    detailSlug: 'alih-kelola-telkom-solution',
  },
  {
    priorityKey: 'priority.high',
    priorityTone: 'high',
    requirement: 'DR BAPL',
    issue: 'Scope adjustment required',
    decision: 'Decide replacement scope in SMILE Adv',
    executiveOwner: 'ESS / SDA / IBP',
    due: '7 Jun',
    detailSlug: 'dr-bapl',
  },
  {
    priorityKey: 'priority.medium',
    priorityTone: 'medium',
    requirement: 'TRAVIS / B2B ITSM',
    issue: 'Contract ending risk',
    decision: 'Confirm target replacement platform',
    executiveOwner: 'CEM / DIT',
    due: '15 Jun',
    detailSlug: 'travis-b2b-itsm',
  },
  {
    priorityKey: 'priority.medium',
    priorityTone: 'medium',
    requirement: 'Smart Capex',
    issue: 'Retirement approach unclear',
    decision: 'Validate migration to SMILE Adv',
    executiveOwner: 'Access / IBP',
    due: '10 Jun',
    detailSlug: 'smart-capex',
  },
]

const demandTrend = [
  { week: 'Mar 31', count: 8 },
  { week: 'Apr 7', count: 12 },
  { week: 'Apr 14', count: 11 },
  { week: 'Apr 21', count: 7 },
  { week: 'Apr 28', count: 10 },
  { week: 'May 5', count: 13 },
  { week: 'May 12', count: 11 },
  { week: 'May 19', count: 12 },
]

const portfolioInitiatives = [
  { name: 'Alih Kelola Aplikasi', count: 8, color: '#6d5dfc' },
  { name: 'B2B Digital Enablement', count: 6, color: '#14b8a6' },
  { name: 'Application Rationalization', count: 5, color: '#3b82f6' },
  { name: 'Governance & Compliance', count: 4, color: '#f59e0b' },
  { name: 'BRM Process Improvement', count: 2, color: '#8b5cf6' },
]

const requestingUnits = [
  { unit: 'Enterprise', count: 8, color: '#6d5dfc' },
  { unit: 'Wholesale', count: 5, color: '#14b8a6' },
  { unit: 'HCM', count: 4, color: '#3b82f6' },
  { unit: 'Finance', count: 3, color: '#f59e0b' },
  { unit: 'Consumer', count: 5, color: '#8b5cf6' },
]

const risks = [
  { titleKey: 'risk.ownershipDecision.title', descriptionKey: 'risk.ownershipDecision.description', icon: FileWarning, tone: 'bad' },
  { titleKey: 'risk.budgetApproval.title', descriptionKey: 'risk.budgetApproval.description', icon: Clock3, tone: 'warning' },
  { titleKey: 'risk.externalDependency.title', descriptionKey: 'risk.externalDependency.description', icon: AlertTriangle, tone: 'warning' },
  { titleKey: 'risk.agingBacklog.title', descriptionKey: 'risk.agingBacklog.description', icon: TrendingDown, tone: 'bad' },
] satisfies { titleKey: TranslationKey; descriptionKey: TranslationKey; icon: IconType; tone: Tone }[]

const healthStats = [
  { labelKey: 'health.status', valueKey: 'status.good' },
  { labelKey: 'health.totalRequirements', value: '25' },
  { labelKey: 'health.totalInitiatives', value: '15' },
  { labelKey: 'health.activeRequestingUnits', value: '5' },
  { labelKey: 'health.openRisks', value: '15' },
] satisfies { labelKey: TranslationKey; value?: string; valueKey?: TranslationKey }[]

function toneClasses(tone: Tone) {
  const map: Record<Tone, string> = {
    good: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    bad: 'bg-red-50 text-red-700 ring-red-200',
    neutral: 'bg-slate-50 text-slate-600 ring-slate-200',
    purple: 'bg-violet-50 text-violet-700 ring-violet-200',
  }
  return map[tone]
}

function iconToneClasses(tone: Tone) {
  const map: Record<Tone, string> = {
    good: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    bad: 'bg-red-50 text-red-600',
    neutral: 'bg-slate-50 text-slate-600',
    purple: 'bg-violet-50 text-violet-600',
  }
  return map[tone]
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
      <p className="mb-1 font-semibold text-slate-700">{label}</p>
      {payload.map((item: any) => (
        <p key={item.dataKey} className="font-medium" style={{ color: item.fill || item.stroke }}>
          {item.value} {t('unit.items')}
        </p>
      ))}
    </div>
  )
}

function KpiCard({ item, idx }: { item: KpiItem; idx: number }) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const Icon = item.icon
  const riskTone = item.trendTone === 'bad' || item.trendTone === 'warning' ? item.trendTone : 'purple'

  return (
    <button
      type="button"
      onClick={() => navigate(item.href)}
      className="group rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_14px_32px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_20px_44px_rgba(79,70,229,0.12)]"
      style={{ animationDelay: `${idx * 35}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition-colors', iconToneClasses(riskTone))}>
          <Icon size={18} />
        </div>
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1', toneClasses(item.trendTone))}>
          {item.trend}
          <span className="hidden xl:inline">{t('kpi.trend.vsLastMonth')}</span>
        </span>
      </div>
      <p className="mt-4 text-[12px] font-medium text-slate-500">{t(item.labelKey)}</p>
      <p className="mt-1 text-[28px] font-semibold tracking-tight text-slate-950">
        {item.value}
        {item.suffixKey && <><span> </span><span className="inline-block text-[18px] font-semibold text-slate-500">{t(item.suffixKey)}</span></>}
      </p>
    </button>
  )
}

function PriorityPill({ priorityKey, tone }: { priorityKey: TranslationKey; tone: 'high' | 'medium' }) {
  const { t } = useI18n()
  return (
    <span className={cn(
      'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1',
      tone === 'high' ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-amber-50 text-amber-700 ring-amber-200',
    )}>
      {t(priorityKey)}
    </span>
  )
}

function ManagementAttentionTable() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <CardShell
      title={t('section.managementAttention')}
      icon={<FileWarning size={17} />}
      action={
        <button
          type="button"
          onClick={() => navigate('/dashboard/management-attention')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-violet-700 transition-colors hover:bg-violet-50"
        >
          {t('button.viewAll')}
          <ArrowRight size={13} />
        </button>
      }
      className="overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.08em] text-slate-400">
              <th className="pb-3 font-semibold">{t('table.priority')}</th>
              <th className="pb-3 font-semibold">{t('table.requirement')}</th>
              <th className="pb-3 font-semibold">{t('table.issue')}</th>
              <th className="pb-3 font-semibold">{t('table.requiredDecision')}</th>
              <th className="pb-3 font-semibold">{t('table.executiveOwner')}</th>
              <th className="pb-3 text-right font-semibold">{t('table.due')}</th>
            </tr>
          </thead>
          <tbody>
            {attentionItems.map((item) => (
              <tr
                key={item.requirement}
                onClick={() => navigate(`/requirements/detail/${item.detailSlug}`)}
                className="group cursor-pointer text-[13px] text-slate-700"
              >
                <td className="border-t border-slate-100 py-3 pr-4">
                  <PriorityPill priorityKey={item.priorityKey} tone={item.priorityTone} />
                </td>
                <td className="border-t border-slate-100 py-3 pr-4 font-semibold text-slate-950 group-hover:text-violet-700">
                  {item.requirement}
                </td>
                <td className="border-t border-slate-100 py-3 pr-4">{item.issue}</td>
                <td className="border-t border-slate-100 py-3 pr-4 text-slate-900">{item.decision}</td>
                <td className="border-t border-slate-100 py-3 pr-4">
                  <span className="rounded-full bg-slate-50 px-2 py-1 text-[12px] font-medium text-slate-600 ring-1 ring-slate-200">
                    {item.executiveOwner}
                  </span>
                </td>
                <td className="border-t border-slate-100 py-3 text-right font-semibold text-slate-900">{item.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  )
}

function DemandTrendChart() {
  const { t } = useI18n()

  return (
    <CardShell
      title={t('section.demandTrend')}
      subtitle={t('section.demandTrend.subtitle')}
      icon={<LineChartIcon size={17} />}
    >
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={demandTrend} margin={{ top: 8, right: 10, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="demandLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6d5dfc" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="url(#demandLine)"
            strokeWidth={3}
            dot={{ r: 4, fill: '#fff', stroke: '#6d5dfc', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#6d5dfc', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardShell>
  )
}

function PortfolioChart() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <CardShell
      title={t('section.portfolioInitiative')}
      icon={<Layers3 size={17} />}
      action={
        <button
          type="button"
          onClick={() => navigate('/dashboard/portfolio-pipeline')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-violet-700 transition-colors hover:bg-violet-50"
        >
          {t('button.viewAll')}
          <ArrowRight size={13} />
        </button>
      }
    >
      <ResponsiveContainer width="100%" height={252}>
        <BarChart layout="vertical" data={portfolioInitiatives} margin={{ top: 4, right: 18, left: 36, bottom: 4 }}>
          <CartesianGrid stroke="#eef2f7" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={145} tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={18}>
            {portfolioInitiatives.map((item) => <Cell key={item.name} fill={item.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardShell>
  )
}

function RequestingUnitChart() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <CardShell title={t('section.requestingUnitDemand')} icon={<Building2 size={17} />}>
      <ResponsiveContainer width="100%" height={252}>
        <BarChart data={requestingUnits} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="unit" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
            barSize={34}
            onClick={(item) => navigate(`/requirements?requesting_unit=${encodeURIComponent(item.unit)}&search=${encodeURIComponent(item.unit)}`)}
            className="cursor-pointer"
          >
            {requestingUnits.map((item) => <Cell key={item.unit} fill={item.color} className="cursor-pointer" />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardShell>
  )
}

function RiskCard() {
  const { t } = useI18n()

  return (
    <CardShell title={t('section.topRisks')} icon={<ShieldAlert size={17} />}>
      <div className="space-y-3">
        {risks.map((risk, idx) => {
          const Icon = risk.icon
          return (
            <div key={risk.titleKey} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', iconToneClasses(risk.tone))}>
                <Icon size={17} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">0{idx + 1}</span>
                  <h3 className="text-[13px] font-semibold text-slate-950">{t(risk.titleKey)}</h3>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{t(risk.descriptionKey)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </CardShell>
  )
}

function OverallHealthCard() {
  const { t } = useI18n()
  const data = [{ name: t('health.overallHealth'), value: 84, fill: '#6d5dfc' }]

  return (
    <CardShell title={t('section.overallHealth')} icon={<BadgeCheck size={17} />}>
      <div className="grid items-center gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="relative h-[174px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="78%" innerRadius="96%" outerRadius="122%" barSize={16} data={data} startAngle={180} endAngle={0}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" background={{ fill: '#eef2f7' }} cornerRadius={16} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-x-0 bottom-1 text-center">
            <p className="text-[38px] font-semibold tracking-tight text-slate-950">84%</p>
            <p className="mt-1 text-[12px] font-medium text-emerald-600">{t('status.good')}</p>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {healthStats.map((stat) => (
            <div key={stat.labelKey} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-medium text-slate-500">{t(stat.labelKey)}</p>
              <p className="mt-1 text-[15px] font-semibold text-slate-950">{stat.valueKey ? t(stat.valueKey) : stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  )
}

export default function DashboardPage() {
  const { t } = useI18n()

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[12px] font-semibold text-violet-700">
            <Target size={13} />
            {t('page.executiveOverview.eyebrow')}
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-slate-950">{t('page.executiveOverview.title')}</h1>
          <p className="mt-1 text-[14px] text-slate-500">{t('page.executiveOverview.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-500 shadow-sm">
          <TrendingUp size={15} className="text-emerald-500" />
          <span>{t('health.overallHealth')}</span>
          <span className="font-semibold text-slate-950">84%</span>
        </div>
      </div>

      <section aria-label={t('section.kpiSummary')} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item, idx) => <KpiCard key={item.labelKey} item={item} idx={idx} />)}
      </section>

      <div className="grid grid-cols-1 gap-5">
        <ManagementAttentionTable />
        <OverallHealthCard />
      </div>

      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <DemandTrendChart />
        <PortfolioChart />
      </div>

      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.78fr)]">
        <RequestingUnitChart />
        <RiskCard />
      </div>

      <div className="rounded-2xl border border-violet-200 bg-violet-50/70 px-4 py-3 text-[12px] leading-relaxed text-violet-800">
        <span className="font-semibold">{t('note.executiveScope')}</span> {t('note.executiveScope.description')}
      </div>
    </div>
  )
}
