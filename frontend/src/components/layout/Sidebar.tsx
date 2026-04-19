
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ListChecks, Columns3, Settings,
  ChevronLeft, ChevronRight, LogOut, Zap, CheckSquare, GanttChartSquare,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useUIStore } from '@/store/ui'
import { useDemoStore } from '@/store/demo'
import { getInitials, cn } from '@/utils'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Home' },
  { to: '/requirements', icon: ListChecks,       label: 'Requirements' },
  { to: '/kanban',       icon: Columns3,         label: 'Board' },
  { to: '/tasks',        icon: CheckSquare,      label: 'Tasks' },
  { to: '/gantt',        icon: GanttChartSquare, label: 'Gantt' },
]

const settingsSubItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-[#191927] text-white z-20 shrink-0',
      'transition-[width] duration-300 ease-in-out',
      sidebarCollapsed ? 'w-[52px]' : 'w-[220px]'
    )}>
      {/* Workspace header */}
      <div className={cn(
        'flex items-center gap-2.5 border-b border-white/[0.06] shrink-0',
        sidebarCollapsed ? 'px-2 py-4 justify-center' : 'px-3 py-4'
      )}>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-[12px] shrink-0 shadow-md shadow-violet-900/40">
          B
        </div>
        {!sidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[13px] truncate text-white/90 leading-tight">BRM Workspace</p>
            {isDemoMode && (
              <span className="inline-flex items-center gap-1 text-[10px] text-violet-400/80 font-medium leading-tight">
                <Zap size={9} className="fill-current" /> Demo Mode
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-1.5 overflow-y-auto space-y-px">
        {!sidebarCollapsed && (
          <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.08em] px-2 pt-2 pb-1.5 select-none">
            Workspace
          </p>
        )}

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 rounded-md text-[13px] font-medium',
              'transition-all duration-150 group select-none',
              sidebarCollapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-[7px]',
              isActive
                ? 'bg-white/[0.1] text-white'
                : 'text-white/45 hover:bg-white/[0.06] hover:text-white/80'
            )}
            title={sidebarCollapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={cn(
                    'shrink-0 transition-colors duration-150',
                    isActive ? 'text-violet-400' : 'text-white/35 group-hover:text-white/60'
                  )}
                />
                {!sidebarCollapsed && <span className="leading-none">{label}</span>}
                {isActive && !sidebarCollapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}

      </nav>

      {/* Bottom */}
      <div className="border-t border-white/[0.06] p-1.5 space-y-px shrink-0">
        {/* User row */}
        <div className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md',
          sidebarCollapsed && 'justify-center px-0'
        )}>
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
            'bg-gradient-to-br from-violet-500/30 to-purple-600/30',
            'border border-violet-500/25 text-violet-300 text-[11px] font-semibold'
          )}>
            {getInitials(user?.full_name)}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white/75 truncate leading-tight">{user?.full_name}</p>
              <p className="text-[10px] text-white/30 capitalize leading-tight">{user?.role}</p>
            </div>
          )}
        </div>

        {/* Settings items */}
        {!sidebarCollapsed && (
          <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.08em] px-2 pt-2 pb-1 select-none">
            Settings
          </p>
        )}
        {settingsSubItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 rounded-md text-[13px] font-medium',
              'transition-all duration-150 group select-none',
              sidebarCollapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-[7px]',
              isActive
                ? 'bg-white/[0.1] text-white'
                : 'text-white/45 hover:bg-white/[0.06] hover:text-white/80'
            )}
            title={sidebarCollapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={15}
                  className={cn(
                    'shrink-0 transition-colors duration-150',
                    isActive ? 'text-violet-400' : 'text-white/35 group-hover:text-white/60'
                  )}
                />
                {!sidebarCollapsed && <span className="leading-none">{label}</span>}
                {isActive && !sidebarCollapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Logout */}
        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-2.5 rounded-md text-[13px] font-medium',
            'text-white/35 hover:text-white/65 hover:bg-white/[0.06]',
            'transition-all duration-150',
            sidebarCollapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-[7px]'
          )}
          title={sidebarCollapsed ? 'Log out' : undefined}
        >
          <LogOut size={15} className="shrink-0" />
          {!sidebarCollapsed && <span>Log out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'w-full flex items-center gap-2.5 rounded-md text-[13px] font-medium',
            'text-white/25 hover:text-white/55 hover:bg-white/[0.06]',
            'transition-all duration-150',
            sidebarCollapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-[7px]'
          )}
        >
          {sidebarCollapsed
            ? <ChevronRight size={15} className="shrink-0" />
            : <><ChevronLeft size={15} className="shrink-0" /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  )
}
