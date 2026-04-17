import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { authApi } from '@/api/endpoints'
import { useAuthStore } from '@/store/auth'
import { useDemoStore } from '@/store/demo'
import { mockUsers } from '@/api/mockData'
import { Zap, ArrowRight, Lock, Mail } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})
type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { setDemoMode } = useDemoStore()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const res = await authApi.login(data)
      setAuth(res.data.user, res.data.access_token, res.data.refresh_token)
      navigate('/dashboard')
      toast.success(`Welcome back, ${res.data.user.full_name}!`)
    } catch {
      toast.error('Cannot reach the server. Use Demo Mode to explore the app.')
    } finally {
      setLoading(false)
    }
  }

  const enterDemoMode = () => {
    const adminUser = mockUsers[0]
    setDemoMode(true)
    setAuth(adminUser, 'demo-token', 'demo-refresh')
    navigate('/dashboard')
    toast.success('Demo mode active — explore freely!')
  }

  return (
    <div className="min-h-screen flex bg-[#f5f6f8]">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-[#191927] p-10 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-sm text-white shadow-lg">
              B
            </div>
            <span className="text-white font-semibold text-[15px]">BRM</span>
          </div>

          <h1 className="text-[28px] font-bold text-white leading-snug mb-3">
            Manage your<br />
            <span className="text-violet-400">requirements</span><br />
            like a pro.
          </h1>
          <p className="text-[14px] text-white/45 leading-relaxed">
            Track, review, and approve business requirements with your team. Kanban boards, activity logs, and real-time collaboration.
          </p>
        </div>

        {/* Feature list */}
        <div className="space-y-3 mb-8">
          {['ClickUp-style kanban & list views', 'Role-based access control', 'PDF & CSV export', 'Real-time notifications'].map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-[13px] text-white/55">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
              {f}
            </div>
          ))}
        </div>

        <p className="text-[11px] text-white/20">© 2025 BRM Workspace</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-sm text-white">
              B
            </div>
            <span className="font-bold text-[17px] text-gray-900">BRM</span>
          </div>

          <div className="mb-7">
            <h2 className="text-[22px] font-bold text-gray-900">Sign in</h2>
            <p className="text-[13px] text-gray-500 mt-1">Welcome back. Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-[12px] font-medium text-gray-600 block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all placeholder:text-gray-400"
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-[12px] font-medium text-gray-600 block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all placeholder:text-gray-400"
                />
              </div>
              {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-[14px] font-semibold rounded-lg transition-all disabled:opacity-60 shadow-sm shadow-violet-600/30 mt-1"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#f5f6f8] px-3 text-[11px] text-gray-400">or try without an account</span>
            </div>
          </div>

          {/* Demo button */}
          <button
            onClick={enterDemoMode}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-[14px] font-semibold rounded-lg transition-all border border-gray-200 hover:border-violet-200 hover:text-violet-700 group"
          >
            <Zap size={15} className="text-violet-400 group-hover:text-violet-600 transition-colors" />
            Try Demo Mode
          </button>
          <p className="text-center text-[11px] text-gray-400 mt-2">
            Full app with mock data — no signup needed
          </p>
        </div>
      </div>
    </div>
  )
}
