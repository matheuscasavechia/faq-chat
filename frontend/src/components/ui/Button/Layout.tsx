import { styles } from './styles'
import type { ButtonProps } from './types'

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...buttonProps
}: ButtonProps): React.JSX.Element => (
  <button
    type="button"
    {...buttonProps}
    className={styles.button(variant, size, className)}
    disabled={disabled ?? isLoading}
    aria-busy={isLoading || undefined}
  >
    {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : null}
    {children}
  </button>
)
