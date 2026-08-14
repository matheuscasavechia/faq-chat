import { styles } from './styles'
import type { ThemeToggleLayoutProps } from './types'

export const ThemeToggleLayout = ({
  theme,
  onToggle,
}: ThemeToggleLayoutProps): React.JSX.Element => (
  <button
    type="button"
    className={styles.toggle}
    onClick={onToggle}
    aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
  >
    <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
  </button>
)
