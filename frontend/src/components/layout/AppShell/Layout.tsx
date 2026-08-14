import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { NAVIGATION_ITEMS, ROUTES } from '@/constants/routes'
import { styles } from './styles'

export const AppShell = (): React.JSX.Element => (
  <div className={styles.shell}>
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <NavLink to={ROUTES.chat} className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            AH
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Atlas Helpdesk</span>
            <span className={styles.brandTagline}>FAQ assistant &amp; usage analytics</span>
          </span>
        </NavLink>

        <div className={styles.actions}>
          <nav className={styles.nav} aria-label="Main navigation">
            {NAVIGATION_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.chat}
                title={item.description}
                className={({ isActive }) => styles.navLink(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <main className={styles.main}>
      <Outlet />
    </main>

    <footer className={styles.footer}>
      Answers come from the registered FAQ knowledge base. Every question is recorded to power the
      analytics dashboard.
    </footer>
  </div>
)
