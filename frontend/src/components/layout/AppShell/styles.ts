import { cx } from '@/utils/cx'
import classes from './styles.module.css'

export const styles = {
  shell: cx(classes.shell),
  header: cx(classes.header),
  headerInner: cx(classes.headerInner),
  brand: cx(classes.brand),
  brandMark: cx(classes.brandMark),
  brandText: cx(classes.brandText),
  brandName: cx(classes.brandName),
  brandTagline: cx(classes.brandTagline),
  actions: cx(classes.actions),
  nav: cx(classes.nav),
  navLink: (isActive: boolean): string => cx(classes.navLink, isActive && classes.navLinkActive),
  main: cx(classes.main),
  footer: cx(classes.footer),
}
