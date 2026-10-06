export function compact(n: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function num(n: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(n))
}

export function cardNo(n: number) {
  return `#${String(n).padStart(5, '0')}`
}

export function timeAgo(ts: number) {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}
