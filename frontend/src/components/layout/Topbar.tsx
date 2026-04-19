import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Bell, Plus, X, Zap } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/api/endpoints'
import { useUIStore } from '@/store/ui'
import { useAuthStore } from '@/store/auth'
import { useDemoStore } from '@/store/demo'
import { formatRelative } from '@/utils'
import RequirementModal from '@/components/requirements/RequirementModal'

const breadcrumbMap: Record<string, string> = {
  '/dashboard':    'Home',
  '/requirements': 'Requirements',
  '/kanban':       'Board',
  '/tasks':        'Tasks',
  '/gantt':        'Gantt',
  '/tags':         'Tags',
  '/settings':     'Settings',
}

const SEARCHABLE_ROUTES = new Set(['/requirements', '/kanban', '/tasks', '/gantt'])

function searchPlaceholder(pathname: string): string {
  if (pathname.startsWith('/tasks')) return 'Search tasks...'
  if (pathname.startsWith('/kanban')) return 'Search board...'
  if (pathname.startsWith('/gantt')) return 'Search timeline...'
  return 'Search requirements...'
}

export default function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { unreadCount, setUnreadCount } = useUIStore()
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const queryClient = useQueryClient()

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

  const breadcrumb = breadcrumbMap[location.pathname] || 'BRM'
  const placeholder = searchPlaceholder(location.pathname)

  return (
    <>
      <header className="h-[52px] bg-white border-b border-gray-200/80 flex items-center px-4 gap-3 shrink-0 z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-gray-800">{breadcrumb}</span>
          {isDemoMode && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-violet-50 text-violet-600 text-[10px] font-semibold rounded-md border border-violet-100">
              <Zap size={9} className="fill-current" /> DEMO
            </span>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-sm relative mx-2">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchKey}
            className="w-full pl-8 pr-8 py-1.5 text-[13px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all placeholder:text-gray-400"
          />
          {search && (
            <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {canCreate && (
            <button
              onClick={() => setShowNewReq(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-medium rounded-md transition-colors shadow-sm shadow-violet-600/20"
            >
              <Plus size={14} />
              New
            </button>
          )}

          {/* Notifications */}
          <div className="relative" ref={notifsRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-gray-200/80 z-50 animate-scale-in overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="font-semibold text-[13px] text-gray-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={() => markAll.mutate()} className="text-[12px] text-violet-600 hover:underline font-medium">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {isDemoMode ? (
                    <div className="px-4 py-6 text-center text-[13px] text-gray-400">
                      <Bell size={20} className="mx-auto mb-2 text-gray-300" />
                      No notifications in demo mode
                    </div>
                  ) : !notifData?.notifications?.length ? (
                    <div className="px-4 py-6 text-center text-[13px] text-gray-400">
                      <Bell size={20} className="mx-auto mb-2 text-gray-300" />
                      You're all caught up!
                    </div>
                  ) : (
                    notifData.notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 text-[13px] border-b last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-violet-50/50' : ''}`}
                        onClick={() => { if (n.link) navigate(n.link); setShowNotifs(false) }}
                      >
                        <p className="text-gray-800 leading-snug">{n.message}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatRelative(n.created_at)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showNewReq && <RequirementModal onClose={() => setShowNewReq(false)} />}
    </>
  )
}
