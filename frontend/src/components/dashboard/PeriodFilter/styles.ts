import { cx } from '@/utils/cx'
import classes from './styles.module.css'

export const styles = {
  group: cx(classes.group),
  option: (isSelected: boolean): string => cx(classes.option, isSelected && classes.optionSelected),
}
