import { cx } from '@/utils/cx'
import classes from './styles.module.css'
import type { StateMessageTone } from './types'

export const styles = {
  wrapper: (tone: StateMessageTone, compact: boolean): string =>
    cx(classes.wrapper, tone === 'error' && classes.error, compact && classes.compact),
  icon: cx(classes.icon),
  title: cx(classes.title),
  description: cx(classes.description),
  action: cx(classes.action),
}
