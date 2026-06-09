import { NavLink, useLocation } from 'react-router-dom'
import {
  AppWindow, BarChart3, Building2, ChevronLeft, ChevronRight, ClipboardList,
  FilePlus2, FileSearch, Gauge, LayoutDashboard, LogOut, Settings, ShieldCheck,
  Sparkles, Target, Zap,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useUIStore } from '@/store/ui'
import { useDemoStore } from '@/store/demo'
import { getInitials, cn } from '@/utils'
import { useI18n, type TranslationKey } from '@/i18n'

const navGroups: {
  labelKey: TranslationKey
  items: { to: string; icon: typeof LayoutDashboard; labelKey: TranslationKey; exact?: boolean }[]
}[] = [
  {
    labelKey: 'nav.dashboard',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.executiveOverview', exact: true },
      { to: '/dashboard/management-attention', icon: Target, labelKey: 'nav.managementAttention' },
      { to: '/dashboard/portfolio-pipeline', icon: BarChart3, labelKey: 'nav.portfolioPipeline' },
      { to: '/dashboard/execution-capacity', icon: Gauge, labelKey: 'nav.executionCapacity' },
    ],
  },
  {
    labelKey: 'nav.requirements',
    items: [
      { to: '/requirements', icon: ClipboardList, labelKey: 'nav.allRequirements', exact: true },
      { to: '/requirements?new=1', icon: FilePlus2, labelKey: 'nav.newRequirement' },
      { to: '/requirements/detail/overview', icon: FileSearch, labelKey: 'nav.requirementDetail' },
    ],
  },
  {
    labelKey: 'nav.governance',
    items: [
      { to: '/governance/alih-kelola', icon: Building2, labelKey: 'nav.alihKelola' },
      { to: '/governance/application-rationalization', icon: AppWindow, labelKey: 'nav.applicationRationalization' },
      { to: '/governance/sla-performance', icon: ShieldCheck, labelKey: 'nav.slaPerformance' },
    ],
  },
]

function isActivePath(pathname: string, target: string, exact?: boolean) {
  const route = target.split('?')[0]
  if (exact) return pathname === route
  return pathname === route || pathname.startsWith(`${route}/`)
}

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const { t } = useI18n()
  const location = useLocation()

  return (
    <aside className={cn(
      'flex h-screen shrink-0 flex-col border-r border-slate-200/80 bg-white text-slate-900 z-20',
      'transition-[width] duration-300 ease-in-out',
      sidebarCollapsed ? 'w-[64px]' : 'w-[270px]',
    )}>
      <div className={cn(
        'flex items-center gap-3 border-b border-slate-200/80 shrink-0',
        sidebarCollapsed ? 'justify-center px-2 py-4' : 'px-5 py-4',
      )}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-[13px] font-bold text-white shadow-lg shadow-violet-900/20">
          B
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold leading-tight text-slate-950">{t('app.workspace')}</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{t('app.unit')}</p>
            {isDemoMode && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 ring-1 ring-violet-200">
                <Zap size={9} className="fill-current" /> {t('app.demoMode')}
              </span>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.labelKey} className="mb-5 last:mb-0">
            {!sidebarCollapsed && (
              <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                {t(group.labelKey)}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map(({ to, icon: Icon, labelKey, exact }) => {
                const active = isActivePath(location.pathname, to, exact)
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={cn(
                      'group flex items-center rounded-xl text-[13px] font-medium transition-all duration-150',
                      sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-3 py-2.5',
                      active
                        ? 'bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-100'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                    )}
                    title={sidebarCollapsed ? t(labelKey) : undefined}
                  >
                    <Icon
                      size={16}
                      className={cn(
                        'shrink-0 transition-colors',
                        active ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600',
                      )}
                    />
                    {!sidebarCollapsed && <span className="min-w-0 truncate leading-none">{t(labelKey)}</span>}
                    {active && !sidebarCollapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500" />}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200/80 p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            'mb-2 flex items-center rounded-xl text-[13px] font-medium transition-colors',
            sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-3 py-2.5',
            isActive ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
          )}
          title={sidebarCollapsed ? t('nav.settings') : undefined}
        >
          <Settings size={16} className="shrink-0" />
          {!sidebarCollapsed && <span>{t('nav.settings')}</span>}
        </NavLink>

        <div className={cn('mb-2 flex items-center gap-2 rounded-xl bg-slate-50 p-2', sidebarCollapsed && 'justify-center')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[12px] font-semibold text-violet-700 ring-1 ring-violet-200">
            {getInitials(user?.full_name)}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold leading-tight text-slate-800">{user?.full_name}</p>
              <p className="mt-0.5 truncate text-[10px] capitalize leading-tight text-slate-500">{user?.role}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={logout}
          className={cn(
            'flex w-full items-center rounded-xl text-[13px] font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700',
            sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-3 py-2.5',
          )}
          title={sidebarCollapsed ? t('nav.logOut') : undefined}
        >
          <LogOut size={16} className="shrink-0" />
          {!sidebarCollapsed && <span>{t('nav.logOut')}</span>}
        </button>

        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            'mt-1 flex w-full items-center rounded-xl text-[13px] font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700',
            sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-3 py-2.5',
          )}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>{t('nav.collapse')}</span></>}
        </button>
      </div>
    </aside>
  )
}
