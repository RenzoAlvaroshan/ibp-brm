import { getInitials, cn } from '@/utils'
import type { User } from '@/types'

interface Props {
  user?: User | null
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  variant?: 'colored' | 'dark'
}

const sizeMap = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-7 h-7 text-xs',
  lg: 'w-9 h-9 text-sm',
}

const colors = [
  'bg-indigo-100 text-indigo-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
]

function colorForName(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function UserAvatar({ user, size = 'md', showName = false, variant = 'colored' }: Props) {
  if (!user) {
    return (
      <div className={cn('rounded-full bg-gray-200 flex items-center justify-center text-gray-400', sizeMap[size])}>
        ?
      </div>
    )
  }
  const initials = getInitials(user.full_name)
  const color = variant === 'dark'
    ? 'bg-gray-800 text-gray-100'
    : colorForName(user.full_name || user.email)

  return (
    <div className="flex items-center gap-2">
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.full_name}
          className={cn('rounded-full object-cover', sizeMap[size])}
        />
      ) : (
        <div
          className={cn('rounded-full flex items-center justify-center font-semibold shrink-0', sizeMap[size], color)}
          title={user.full_name}
        >
          {initials}
        </div>
      )}
      {showName && <span className="text-sm text-gray-700">{user.full_name}</span>}
    </div>
  )
}
