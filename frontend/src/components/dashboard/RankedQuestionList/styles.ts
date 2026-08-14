import { cx } from '@/utils/cx'
import classes from './styles.module.css'
import type { RankedQuestionListProps } from './types'

type Tone = NonNullable<RankedQuestionListProps['tone']>

const FILL_CLASS: Record<Tone, string | undefined> = {
  accent: classes.fillAccent,
  attention: classes.fillAttention,
}

export const styles = {
  list: cx(classes.list),
  item: cx(classes.item),
  header: cx(classes.header),
  question: cx(classes.question),
  total: cx(classes.total),
  meta: cx(classes.meta),
  track: cx(classes.track),
  fill: (tone: Tone): string => cx(classes.fill, FILL_CLASS[tone]),
}
