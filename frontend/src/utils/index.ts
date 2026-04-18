import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Priority, Status } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const statusConfig: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  todo:                 { label: 'To Do',           color: 'text-gray-600',   bg: 'bg-gray-100',   dot: 'bg-gray-400' },
  requirement_gathering:{ label: 'Req. Gathering',  color: 'text-blue-700',   bg: 'bg-blue-50',    dot: 'bg-blue-400' },
  development:          { label: 'Development',     color: 'text-indigo-700', bg: 'bg-indigo-50',  dot: 'bg-indigo-400' },
  sit:                  { label: 'SIT',             color: 'text-amber-700',  bg: 'bg-amber-50',   dot: 'bg-amber-400' },
  uat:                  { label: 'UAT',             color: 'text-violet-700', bg: 'bg-violet-50',  dot: 'bg-violet-400' },
  d2p:                  { label: 'D2P',             color: 'text-pink-700',   bg: 'bg-pink-50',    dot: 'bg-pink-400' },
  production_test:      { label: 'Production Test', color: 'text-orange-700', bg: 'bg-orange-50',  dot: 'bg-orange-400' },
  completed:            { label: 'Completed',       color: 'text-green-700',  bg: 'bg-green-50',   dot: 'bg-green-500' },
}

export const priorityConfig: Record<Priority, { label: string; color: string; bg: string; hex: string }> = {
  critical: { label: 'Critical', color: 'text-red-700',    bg: 'bg-red-50',    hex: '#EF4444' },
  high:     { label: 'High',     color: 'text-orange-700', bg: 'bg-orange-50', hex: '#F97316' },
  medium:   { label: 'Medium',   color: 'text-blue-700',   bg: 'bg-blue-50',   hex: '#3B82F6' },
  low:      { label: 'Low',      color: 'text-gray-600',   bg: 'bg-gray-100',  hex: '#6B7280' },
}

export const TAG_PALETTE = [
  '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#84CC16',
  '#06B6D4', '#A855F7',
]

export function formatDate(date?: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function formatRelative(date: string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return formatDate(date)
}

export function getInitials(name?: string): string {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function actionLabel(action: string): string {
  const map: Record<string, string> = {
    created: 'created this requirement',
    status_changed: 'changed the status',
    comment_added: 'added a comment',
    updated: 'updated this requirement',
    assigned: 'changed the assignee',
  }
  return map[action] || action
}
