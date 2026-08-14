import { useTheme } from '@/hooks/useTheme'
import { ThemeToggleLayout } from './Layout'

export const ThemeToggle = (): React.JSX.Element => {
  const { theme, toggleTheme } = useTheme()

  return <ThemeToggleLayout theme={theme} onToggle={toggleTheme} />
}
