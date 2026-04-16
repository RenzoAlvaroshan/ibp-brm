import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, Plus, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/api/endpoints'
import { useUIStore } from '@/store/ui'
import { useAuthStore } from '@/store/auth'
import { formatRelative } from '@/utils'
import RequirementModal from '@/components/requirements/RequirementModal'

const breadcrumbMap: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/requirements': 'Requirements',
  '/kanban':       'Kanban Board',
  '/tags':         'Tags',
  '/settings':     'Settings',
}

export default function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { unreadCount, setUnreadCount } = useUIStore()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [showNotifs, setShowNotifs] = useState(false)
  const [showNewReq, setShowNewReq] = useState(false)
  const notifsRef = useRef<HTMLDivElement>(null)

  const canCreate = user?.role === 'admin' || user?.role === 'editor'

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then((r) => r.data),
    refetchInterval: 30_000,
  })

  useEffect(() => {
    if (notifData) setUnreadCount(notifData.unread_count)
  }, [notifData, setUnreadCount])

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  // Close notifs panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/requirements?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const breadcrumb = breadcrumbMap[location.pathname] || 'BRM'

  return (
    <>
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0">
        {/* Breadcrumb */}
        <span className="text-sm font-semibold text-gray-700 min-w-[100px]">{breadcrumb}</span>

        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search requirements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={14} className="text-gray-400" />
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {canCreate && (
            <button
              onClick={() => setShowNewReq(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Plus size={15} />
              New Requirement
            </button>
          )}

          {/* Notifications */}
          <div className="relative" ref={notifsRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-md hover:bg-gray-100 text-gray-600"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <span className="font-semibold text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAll.mutate()}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {!notifData?.notifications?.length ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">No notifications</div>
                  ) : (
                    notifData.notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 text-sm border-b last:border-0 cursor-pointer hover:bg-gray-50 ${!n.is_read ? 'bg-indigo-50' : ''}`}
                        onClick={() => {
                          if (n.link) navigate(n.link)
                          setShowNotifs(false)
                        }}
                      >
                        <p className="text-gray-800 leading-snug">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatRelative(n.created_at)}</p>
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
