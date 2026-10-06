import { Home, IdCard, Swords, Store, Hammer, Trophy, ListOrdered, UserRound, Map, Vault, Shield, ScanLine } from 'lucide-react'

export const PRIMARY_NAV = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/card', label: 'My Card', icon: IdCard },
  { href: '/arena', label: 'Arena', icon: Swords },
  { href: '/market', label: 'Marketplace', icon: Store },
  { href: '/forge', label: 'Forge', icon: Hammer },
  { href: '/championships', label: 'Championships', icon: Trophy },
  { href: '/leaderboard', label: 'Leaderboard', icon: ListOrdered },
  { href: '/profile', label: 'Profile', icon: UserRound },
] as const

export const SECONDARY_NAV = [
  { href: '/scan', label: 'Scan Your CT', icon: ScanLine },
  { href: '/world', label: 'Cult World', icon: Map },
  { href: '/vault', label: 'Vault & Quests', icon: Vault },
  { href: '/guilds', label: 'Guilds', icon: Shield },
] as const

export const MOBILE_NAV = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/card', label: 'Card', icon: IdCard },
  { href: '/arena', label: 'Arena', icon: Swords },
  { href: '/market', label: 'Market', icon: Store },
  { href: '/profile', label: 'Profile', icon: UserRound },
] as const

export function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}
