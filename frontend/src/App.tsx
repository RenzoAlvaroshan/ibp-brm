import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import AppShell from '@/components/layout/AppShell'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ExecutionCapacityPage from '@/pages/ExecutionCapacityPage'
import ManagementAttentionPage from '@/pages/ManagementAttentionPage'
import PortfolioPipelinePage from '@/pages/PortfolioPipelinePage'
import PlaceholderPage from '@/pages/PlaceholderPage'
import RequirementsPage from '@/pages/RequirementsPage'
import KanbanPage from '@/pages/KanbanPage'
import SettingsPage from '@/pages/SettingsPage'
import TagsPage from '@/pages/TagsPage'
import AppsPage from '@/pages/AppsPage'
import TasksPage from '@/pages/TasksPage'
import GanttPage from '@/pages/GanttPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dashboard/management-attention" element={<ManagementAttentionPage />} />
          <Route path="dashboard/portfolio-pipeline" element={<PortfolioPipelinePage />} />
          <Route path="dashboard/execution-capacity" element={<ExecutionCapacityPage />} />
          <Route path="requirements" element={<RequirementsPage />} />
          <Route path="requirements/detail/:slug" element={<PlaceholderPage parentKey="nav.requirements" titleKey="nav.requirementDetail" />} />
          <Route path="governance/alih-kelola" element={<PlaceholderPage parentKey="nav.governance" titleKey="nav.alihKelola" />} />
          <Route path="governance/application-rationalization" element={<PlaceholderPage parentKey="nav.governance" titleKey="nav.applicationRationalization" />} />
          <Route path="governance/sla-performance" element={<PlaceholderPage parentKey="nav.governance" titleKey="nav.slaPerformance" />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="gantt" element={<GanttPage />} />
          <Route path="tags" element={<TagsPage />} />
          <Route path="apps" element={<AppsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
