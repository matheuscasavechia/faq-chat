import { Provider as JotaiProvider } from 'jotai'
import type { ReactNode } from 'react'
import { QueryProvider } from './QueryProvider'
import { ThemeProvider } from './ThemeProvider'

export const AppProviders = ({ children }: { children: ReactNode }): React.JSX.Element => (
  <ThemeProvider>
    <JotaiProvider>
      <QueryProvider>{children}</QueryProvider>
    </JotaiProvider>
  </ThemeProvider>
)
