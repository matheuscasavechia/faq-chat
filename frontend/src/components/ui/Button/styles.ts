import { cx } from '@/utils/cx'
import classes from './styles.module.css'
import type { ButtonSize, ButtonVariant } from './types'

const VARIANT_CLASS: Record<ButtonVariant, string | undefined> = {
  primary: classes.primary,
  secondary: classes.secondary,
  ghost: classes.ghost,
}

const SIZE_CLASS: Record<ButtonSize, string | undefined> = {
  sm: classes.sizeSm,
  md: classes.sizeMd,
}

export const styles = {
  button: (variant: ButtonVariant, size: ButtonSize, className?: string): string =>
    cx(classes.base, VARIANT_CLASS[variant], SIZE_CLASS[size], className),
  spinner: cx(classes.spinner),
}
