import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, CalendarDays, Download, Plus, Search, SlidersHorizontal, X, Zap } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/api/endpoints'
import { useUIStore } from '@/store/ui'
import { useAuthStore } from '@/store/auth'
import { useDemoStore } from '@/store/demo'
import { formatRelative, getInitials } from '@/utils'
import RequirementModal from '@/components/requirements/RequirementModal'
import { useI18n, type TranslationKey } from '@/i18n'

const breadcrumbMap: Record<string, TranslationKey> = {
  '/dashboard': 'nav.executiveOverview',
  '/dashboard/management-attention': 'nav.managementAttention',
  '/dashboard/portfolio-pipeline': 'nav.portfolioPipeline',
  '/dashboard/execution-capacity': 'nav.executionCapacity',
  '/requirements': 'nav.allRequirements',
  '/kanban': 'nav.requirements',
  '/tasks': 'nav.requirements',
  '/gantt': 'nav.requirements',
  '/tags': 'nav.requirements',
  '/settings': 'nav.settings',
  '/governance/alih-kelola': 'nav.alihKelola',
  '/governance/application-rationalization': 'nav.applicationRationalization',
  '/governance/sla-performance': 'nav.slaPerformance',
}

const SEARCHABLE_ROUTES = new Set(['/requirements', '/kanban', '/tasks', '/gantt'])

function searchPlaceholder(pathname: string): TranslationKey {
  if (pathname.startsWith('/dashboard')) return 'topbar.searchExecutive'
  if (pathname.startsWith('/tasks')) return 'topbar.searchTasks'
  if (pathname.startsWith('/kanban')) return 'topbar.searchBoard'
  if (pathname.startsWith('/gantt')) return 'topbar.searchTimeline'
  return 'topbar.searchRequirements'
}

function breadcrumbKey(pathname: string): TranslationKey {
  if (pathname.startsWith('/requirements/detail')) return 'nav.requirementDetail'
  return breadcrumbMap[pathname] || 'nav.executiveOverview'
}

export default function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { unreadCount, setUnreadCount } = useUIStore()
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const queryClient = useQueryClient()
  const { t } = useI18n()

  const [searchParams, setSearchParams] = useSearchParams()
  const isSearchableRoute = SEARCHABLE_ROUTES.has(location.pathname)
  const urlSearch = isSearchableRoute ? (searchParams.get('search') || '') : ''
  const [localSearch, setLocalSearch] = useState('')
  const search = isSearchableRoute ? urlSearch : localSearch

  const [showNotifs, setShowNotifs] = useState(false)
  const [showNewReq, setShowNewReq] = useState(false)
  const notifsRef = useRef<HTMLDivElement>(null)

  const canCreate = user?.role === 'admin' || user?.role === 'editor'

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then((r) => r.data),
    refetchInterval: 30_000,
    enabled: !isDemoMode,
  })

  useEffect(() => {
    if (notifData) setUnreadCount(notifData.unread_count)
  }, [notifData, setUnreadCount])

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearchChange = (value: string) => {
    if (isSearchableRoute) {
      const next = new URLSearchParams(searchParams)
      if (value) next.set('search', value)
      else next.delete('search')
      setSearchParams(next, { replace: true })
    } else {
      setLocalSearch(value)
    }
  }

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSearchableRoute && localSearch.trim()) {
      navigate(`/requirements?search=${encodeURIComponent(localSearch.trim())}`)
      setLocalSearch('')
    }
  }

  const clearSearch = () => handleSearchChange('')
  const placeholder = t(searchPlaceholder(location.pathname))

  return (
    <>
      <header className="h-[64px] shrink-0 border-b border-slate-200/80 bg-white px-5 z-10">
        <div className="flex h-full items-center gap-3">
          <div className="min-w-[180px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{t('nav.dashboard')}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="truncate text-[14px] font-semibold text-slate-900">{t(breadcrumbKey(location.pathname))}</span>
              {isDemoMode && (
                <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-600 ring-1 ring-violet-100">
                  <Zap size={9} className="fill-current" /> DEMO
                </span>
              )}
            </div>
          </div>

          <div className="relative mx-2 hidden min-w-[260px] max-w-xl flex-1 md:block">
            <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKey}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-[13px] text-slate-800 transition-all placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-100"
            />
            {search && (
              <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 lg:inline-flex"
            >
              <CalendarDays size={14} />
              {t('topbar.dateRange')}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
            >
              <SlidersHorizontal size={14} />
              {t('topbar.filter')}
            </button>
            <button
              type="button"
              className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 sm:inline-flex"
            >
              <Download size={14} />
              {t('topbar.export')}
            </button>

            {canCreate && (
              <button
                type="button"
                onClick={() => setShowNewReq(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-[12px] font-semibold text-white shadow-sm shadow-violet-600/20 transition-colors hover:bg-violet-700"
              >
                <Plus size={14} />
                {t('topbar.new')}
              </button>
            )}

            <div className="relative" ref={notifsRef}>
              <button
                type="button"
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="animate-scale-in absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <span className="text-[13px] font-semibold text-slate-800">{t('topbar.notifications')}</span>
                    {unreadCount > 0 && (
                      <button type="button" onClick={() => markAll.mutate()} className="text-[12px] font-medium text-violet-600 hover:underline">
                        {t('topbar.markAllRead')}
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {isDemoMode ? (
                      <div className="px-4 py-6 text-center text-[13px] text-slate-400">
                        <Bell size={20} className="mx-auto mb-2 text-slate-300" />
                        {t('topbar.noNotifications')}
                      </div>
                    ) : !notifData?.notifications?.length ? (
                      <div className="px-4 py-6 text-center text-[13px] text-slate-400">
                        <Bell size={20} className="mx-auto mb-2 text-slate-300" />
                        {t('topbar.caughtUp')}
                      </div>
                    ) : (
                      notifData.notifications.slice(0, 10).map((n) => (
                        <button
                          type="button"
                          key={n.id}
                          className={`block w-full border-b px-4 py-3 text-left text-[13px] transition-colors last:border-0 hover:bg-slate-50 ${!n.is_read ? 'bg-violet-50/50' : ''}`}
                          onClick={() => { if (n.link) navigate(n.link); setShowNotifs(false) }}
                        >
                          <p className="leading-snug text-slate-800">{n.message}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">{formatRelative(n.created_at)}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm xl:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-[12px] font-semibold text-violet-700 ring-1 ring-violet-200">
                {getInitials(user?.full_name)}
              </div>
              <div className="max-w-[140px]">
                <p className="truncate text-[12px] font-semibold leading-tight text-slate-800">{user?.full_name}</p>
                <p className="mt-0.5 truncate text-[10px] capitalize leading-tight text-slate-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {showNewReq && <RequirementModal onClose={() => setShowNewReq(false)} />}
    </>
  )
}
