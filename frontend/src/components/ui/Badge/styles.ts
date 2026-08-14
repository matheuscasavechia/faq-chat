import { cx } from '@/utils/cx'
import classes from './styles.module.css'
import type { BadgeTone } from './types'

const TONE_CLASS: Record<BadgeTone, string | undefined> = {
  neutral: classes.neutral,
  accent: classes.accent,
  positive: classes.positive,
  attention: classes.attention,
}

export const styles = {
  badge: (tone: BadgeTone): string => cx(classes.badge, TONE_CLASS[tone]),
}
