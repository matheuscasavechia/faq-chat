import { cx } from '@/utils/cx'
import classes from './styles.module.css'

export const styles = {
  card: (className?: string): string => cx(classes.card, className),
  header: cx(classes.header),
  heading: cx(classes.heading),
  title: cx(classes.title),
  subtitle: cx(classes.subtitle),
  body: cx(classes.body),
}
