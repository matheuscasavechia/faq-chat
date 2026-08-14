import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { THEME_STORAGE_KEY, ThemeContext, type ThemeName } from '@/contexts/ThemeContext'

const readStoredTheme = (): ThemeName | null => {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : null
}

const resolveInitialTheme = (): ThemeName => {
  const stored = readStoredTheme()
  if (stored) return stored

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (theme: ThemeName): void => {
  document.documentElement.dataset.theme = theme
}

export const ThemeProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const initial = resolveInitialTheme()
    applyTheme(initial)
    return initial
  })

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: ThemeName = current === 'light' ? 'dark' : 'light'
      applyTheme(next)
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
