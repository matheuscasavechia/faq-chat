import type { ThemeName } from '@/contexts/ThemeContext'

export interface ThemeToggleLayoutProps {
  theme: ThemeName
  onToggle: () => void
}
