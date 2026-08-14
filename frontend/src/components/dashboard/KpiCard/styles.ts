import { cx } from '@/utils/cx'
import classes from './styles.module.css'
import type { KpiTone } from './types'

const TONE_CLASS: Record<KpiTone, string | undefined> = {
  neutral: undefined,
  positive: classes.positive,
  attention: classes.attention,
}

export const styles = {
  card: (isRefreshing: boolean): string => cx(classes.card, isRefreshing && classes.refreshing),
  label: cx(classes.label),
  value: (tone: KpiTone): string => cx(classes.value, TONE_CLASS[tone]),
  hint: cx(classes.hint),
}
