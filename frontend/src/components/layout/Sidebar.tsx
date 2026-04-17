import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ListChecks, Columns3, Tag, Settings,
  ChevronLeft, ChevronRight, Bell, LogOut, AppWindow,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useUIStore } from '@/store/ui'
import { getInitials } from '@/utils'
import { cn } from '@/utils'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/requirements', icon: ListChecks,       label: 'Requirements' },
  { to: '/kanban',       icon: Columns3,         label: 'Kanban' },
  { to: '/tags',         icon: Tag,              label: 'Tags' },
  { to: '/apps',         icon: AppWindow,        label: 'Apps' },
  { to: '/settings',     icon: Settings,         label: 'Settings' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar, unreadCount } = useUIStore()

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-[#5B21B6] text-white transition-all duration-200 z-20 shrink-0',
        sidebarCollapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-purple-400/30 h-14">
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm shrink-0">
          B
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-sm truncate">BRM Workspace</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors',
                'hover:bg-white/10',
                isActive ? 'bg-white/20 text-white' : 'text-purple-200',
                sidebarCollapsed && 'justify-center'
              )
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-purple-400/30 p-2 space-y-1">
        <NavLink
          to="/notifications"
          className={cn(
            'flex items-center gap-3 px-2 py-2 rounded-md text-sm text-purple-200 hover:bg-white/10 relative',
            sidebarCollapsed && 'justify-center'
          )}
          title={sidebarCollapsed ? 'Notifications' : undefined}
        >
          <Bell size={18} className="shrink-0" />
          {!sidebarCollapsed && <span>Notifications</span>}
          {unreadCount > 0 && (
            <span className={cn(
              'absolute top-1 bg-red-500 text-white text-xs rounded-full font-bold',
              sidebarCollapsed ? 'right-1 w-4 h-4 flex items-center justify-center' : 'right-2 px-1'
            )}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>

        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm text-purple-200 hover:bg-white/10',
            sidebarCollapsed && 'justify-center'
          )}
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>

        {/* User */}
        <div className={cn(
          'flex items-center gap-3 px-2 py-2 rounded-md mt-1',
          sidebarCollapsed && 'justify-center'
        )}>
          <div className="w-7 h-7 rounded-full bg-purple-300 text-purple-900 flex items-center justify-center text-xs font-bold shrink-0">
            {getInitials(user?.full_name)}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-purple-300 capitalize">{user?.role}</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm text-purple-200 hover:bg-white/10',
            sidebarCollapsed && 'justify-center'
          )}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : (
            <>
              <ChevronLeft size={18} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
