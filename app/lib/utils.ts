import { format, formatDistanceToNow } from 'date-fns'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Math.random().toString(36).substring(2, 7)
}

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  return format(new Date(date), pattern)
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "EEE, MMM d · h:mm a")
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatCurrency(amount: number, currency = 'KES'): string {
  if (amount === 0) return 'FREE'
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'TF-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateTicketCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const segment = (n: number) => Array.from({ length: n }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('')
  return `${segment(4)}-${segment(4)}-${segment(4)}`
}

export const EVENT_CATEGORIES = [
  'Music', 'Sports', 'Arts & Culture', 'Food & Drink',
  'Business', 'Technology', 'Education', 'Health & Wellness',
  'Fashion', 'Film & Media', 'Community', 'Other'
] as const

export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-300',
  published: 'bg-mint-500/20 text-mint-400',
  cancelled: 'bg-red-500/20 text-red-400',
  completed: 'bg-blue-500/20 text-blue-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-mint-500/20 text-mint-400',
  valid: 'bg-mint-500/20 text-mint-400',
  used: 'bg-gray-500/20 text-gray-400',
  refunded: 'bg-orange-500/20 text-orange-400',
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
