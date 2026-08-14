import { useDashboardAnalytics } from './hooks/useDashboardAnalytics'
import { DashboardPageLayout } from './Layout'

export const DashboardPage = (): React.JSX.Element => {
  const viewModel = useDashboardAnalytics()

  return <DashboardPageLayout {...viewModel} />
}
