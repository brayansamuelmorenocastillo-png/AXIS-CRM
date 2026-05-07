import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(value: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
}

export function fmtDate(date: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date))
}

export function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function getAvatarColor(name: string) {
  const colors = ['#6ea8fe', '#a371f7', '#3fb950', '#d29922', '#f85149', '#58a6ff']
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}
