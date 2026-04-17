import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { DrawerNav, DrawerTrigger } from './Menu'

const DRAWER_ID = 'main-nav-drawer'

export default function Layout({ children }) {
  const location = useLocation()

  useEffect(() => {
    const el = document.getElementById(DRAWER_ID)
    if (el) el.checked = false
    // Reset window scroll so layout padding (e.g. pt-16 for the menu) stays visible; otherwise the
    // previous page’s scroll position makes the new route look flush to the top until you scroll up.
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [location.pathname])

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-[-10] pointer-events-none">
        <div className="absolute animate-float-primary-pulse-subtle w-[420px] h-[420px] rounded-full blur-3xl bg-primary animation-delay-0" />
        <div className="absolute animate-float-secondary-pulse-subtle w-[350px] h-[350px] rounded-full blur-3xl bg-secondary animation-delay-500" />
        <div className="absolute animate-float-accent-pulse-subtle w-[580px] h-[580px] rounded-full blur-2xl bg-accent animation-delay-1000" />
        <div className="absolute animate-float-base-pulse-subtle w-[580px] h-[580px] rounded-full blur-2xl bg-base-200 animation-delay-1500" />
        <div className="absolute animate-float-alt1-pulse-subtle w-[580px] h-[580px] rounded-full blur-2xl bg-primary animation-delay-2000" />
        <div className="absolute animate-float-alt2-pulse-subtle w-[580px] h-[580px] rounded-full blur-xl bg-secondary animation-delay-2500" />
        <div className="absolute animate-float-alt3-pulse-subtle w-[580px] h-[580px] rounded-full blur-lg bg-accent animation-delay-3000" />
        <div className="absolute animate-float-alt4-pulse-subtle w-[580px] h-[580px] rounded-full blur bg-base-200 animation-delay-3500" />
      </div>

      <div className="drawer">
        <input id={DRAWER_ID} type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex min-h-screen flex-col">
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>
          <DrawerTrigger drawerInputId={DRAWER_ID} />
          <div id="main-content" className="content flex-1 px-4 pb-4 pt-16 sm:px-6 sm:pt-16 md:px-8" tabIndex={-1}>
            {children}
          </div>
        </div>
        <DrawerNav drawerInputId={DRAWER_ID} />
      </div>
    </div>
  )
}
