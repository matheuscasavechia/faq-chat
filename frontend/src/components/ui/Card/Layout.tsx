import { styles } from './styles'
import type { CardProps } from './types'

export const Card = ({
  title,
  subtitle,
  actions,
  children,
  className,
  as: Element = 'section',
}: CardProps): React.JSX.Element => (
  <Element className={styles.card(className)}>
    {title || actions ? (
      <header className={styles.header}>
        <div className={styles.heading}>
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        {actions}
      </header>
    ) : null}
    <div className={styles.body}>{children}</div>
  </Element>
)
