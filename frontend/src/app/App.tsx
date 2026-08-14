import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './providers/AppProviders'
import { router } from './router'

export const App = (): React.JSX.Element => (
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
)
