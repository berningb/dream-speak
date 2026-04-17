import { Link, NavLink, useLocation } from 'react-router-dom'
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext'
import { useBackendUser } from '../hooks/useUsers'
import { avatarImgProps, getAvatarSrc } from '../utils'
import { IoMenu } from 'react-icons/io5'

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-base transition-colors hover:bg-base-content/10 ${isActive ? 'bg-primary/15 text-primary font-medium' : 'text-base-content/90'}`

export function DrawerTrigger({ drawerInputId }) {
  return (
    <label
      htmlFor={drawerInputId}
      className="fixed left-4 top-4 z-30 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-base-300/80 bg-base-100/90 text-base-content shadow-lg backdrop-blur-md transition-opacity hover:opacity-95 supports-[backdrop-filter]:bg-base-100/80"
      aria-label="Open menu"
    >
      <IoMenu className="h-6 w-6" />
    </label>
  )
}

export function DrawerNav({ drawerInputId }) {
  const { isAuthenticated, loginWithGoogle, user, logout } = useFirebaseAuth()
  const { backendUser } = useBackendUser()
  const location = useLocation()
  const isHomeActive = location.pathname === '/' || location.pathname === '/home'

  const close = () => {
    const el = document.getElementById(drawerInputId)
    if (el) el.checked = false
  }

  const drawerAvatarSrc = getAvatarSrc({ user, backendUser })

  return (
    <div className="drawer-side z-40">
      <label htmlFor={drawerInputId} className="drawer-overlay" aria-label="Close menu" />
      <aside className="flex min-h-full w-72 max-w-[86vw] flex-col border-r border-base-content/10 bg-base-200/98 p-0 backdrop-blur-md supports-[backdrop-filter]:bg-base-200/90">
        <div className="border-b border-base-content/10 px-4 py-5">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight" onClick={close}>
            <span className="text-2xl" aria-hidden>🌙</span>
            <span>DreamSpeak</span>
          </Link>
          <p className="mt-1 text-xs text-base-content/55">Navigate your dream journal</p>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          <NavLink
            to="/"
            className={() => linkClass({ isActive: isHomeActive })}
            onClick={close}
          >
            Home
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/explore" className={linkClass} onClick={close}>
                Explore
              </NavLink>
              <NavLink to="/my-dreams" className={linkClass} onClick={close}>
                My Dreams
              </NavLink>
              <NavLink to="/overview" className={linkClass} onClick={close}>
                Monthly overview
              </NavLink>
              <NavLink to="/favorites" className={linkClass} onClick={close}>
                Favorites
              </NavLink>
              <NavLink to="/connections" className={linkClass} onClick={close}>
                Connections
              </NavLink>
              <NavLink to="/analytics" className={linkClass} onClick={close}>
                Analytics
              </NavLink>
            </>
          ) : (
            <NavLink to="/explore" className={linkClass} onClick={close}>
              Explore
            </NavLink>
          )}
        </nav>

        <div className="mt-auto border-t border-base-content/10 p-4">
          {!isAuthenticated ? (
            <button type="button" className="btn btn-primary btn-block" onClick={() => { close(); loginWithGoogle() }}>
              Sign in with Google
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/settings"
                className="flex items-center gap-3 rounded-lg bg-base-300/50 px-2 py-2 transition-colors hover:bg-base-300/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={close}
                aria-label="Profile and settings"
              >
                <div className="avatar">
                  <div className="w-12 rounded-full">
                    <img src={drawerAvatarSrc} alt="" {...avatarImgProps(drawerAvatarSrc)} />
                  </div>
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium">
                    {backendUser?.username || user?.email?.split('@')[0] || user?.displayName || 'Dreamer'}
                  </p>
                  {user?.email && <p className="truncate text-xs text-base-content/50">{user.email}</p>}
                </div>
              </Link>
              <button
                type="button"
                className="btn btn-ghost btn-sm w-full justify-start text-base-content/80"
                onClick={() => { close(); logout() }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
