import { cx } from '@/utils/cx'
import classes from './styles.module.css'

export const styles = {
  page: cx(classes.page),
  header: cx(classes.header),
  heading: cx(classes.heading),
  title: cx(classes.title),
  description: cx(classes.description),
  controls: cx(classes.controls),
  status: cx(classes.status),
  kpiGrid: cx(classes.kpiGrid),
  chartGrid: cx(classes.chartGrid),
  listGrid: cx(classes.listGrid),
  refreshable: (isRefreshing: boolean): string => cx(isRefreshing && classes.refreshing),
}
