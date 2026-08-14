import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { Provider as JotaiProvider, createStore } from 'jotai'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/app/providers/ThemeProvider'

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  })

export interface RenderOptions {
  route?: string
  queryClient?: QueryClient
}

export interface RenderedApp {
  queryClient: QueryClient
  unmount: () => void
}

export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', queryClient = createTestQueryClient() }: RenderOptions = {},
): RenderedApp => {
  const store = createStore()

  const Wrapper = ({ children }: { children: ReactNode }): React.JSX.Element => (
    <ThemeProvider>
      <JotaiProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </QueryClientProvider>
      </JotaiProvider>
    </ThemeProvider>
  )

  const { unmount } = render(ui, { wrapper: Wrapper })

  return { queryClient, unmount }
}
