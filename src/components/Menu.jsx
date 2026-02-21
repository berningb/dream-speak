import { Link, NavLink } from 'react-router-dom'
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext'
import { IoColorPaletteOutline } from 'react-icons/io5'
import SelectorTheme, { ThemeSelectorContent } from './SelectorTheme'

export default function Menu() {
  const { isAuthenticated, loginWithGoogle, user, logout } = useFirebaseAuth()

  return (
    <div className="navbar bg-base-100 px-6 md:px-8">
      <div className="navbar-start">
        {isAuthenticated && (
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="dropdown-content mt-3 z-[9999] p-2 shadow bg-base-100 rounded-box w-52 flex flex-col gap-1">
            <li><NavLink to="/explore" className={({ isActive }) => `block py-1.5 text-base hover:text-primary active:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}>Explore</NavLink></li>
            <li><NavLink to="/my-dreams" className={({ isActive }) => `block py-1.5 text-base hover:text-primary active:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}>My Dreams</NavLink></li>
            <li><NavLink to="/favorites" className={({ isActive }) => `block py-1.5 text-base hover:text-primary active:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}>Favorites</NavLink></li>
            <li><NavLink to="/connections" className={({ isActive }) => `block py-1.5 text-base hover:text-primary active:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}>Connections</NavLink></li>
            <li><NavLink to="/analytics" className={({ isActive }) => `block py-1.5 text-base hover:text-primary active:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}>Analytics</NavLink></li>
          </ul>
        </div>
        )}
        <Link to="/" className="text-xl font-semibold flex items-center hover:opacity-80 transition-opacity">
          <span className="text-2xl">🌙</span>
          <span className="ml-2">DreamSpeak</span>
        </Link>
      </div>
      {isAuthenticated && (
      <div className="navbar-center hidden lg:flex">
        <ul className="flex items-center gap-6">
          <li><NavLink to="/explore" className={({ isActive }) => `text-base hover:text-primary active:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}>Explore</NavLink></li>
          <li><NavLink to="/my-dreams" className={({ isActive }) => `text-base hover:text-primary active:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}>My Dreams</NavLink></li>
          <li><NavLink to="/favorites" className={({ isActive }) => `text-base hover:text-primary active:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}>Favorites</NavLink></li>
          <li><NavLink to="/connections" className={({ isActive }) => `text-base hover:text-primary active:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}>Connections</NavLink></li>
          <li><NavLink to="/analytics" className={({ isActive }) => `text-base hover:text-primary active:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}>Analytics</NavLink></li>
        </ul>
      </div>
      )}
      <div className="navbar-end">
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <SelectorTheme />
              <button className="btn btn-primary" onClick={loginWithGoogle}>
                Sign In
              </button>
            </>
          ) : (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar w-12 h-12 min-h-0 p-0">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img 
                    alt="Profile" 
                    src={user?.photoURL || '/default-avatar.png'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <ul tabIndex={0} className="dropdown-content mt-3 z-[9999] py-2 px-2 shadow bg-base-100 rounded-box w-72 max-h-[70vh] overflow-y-auto flex flex-col gap-0">
                <li>
                  <details>
                    <summary className="flex items-center gap-2 text-base py-1.5 cursor-pointer hover:text-primary active:text-primary transition-colors">
                      <IoColorPaletteOutline className="text-xl shrink-0" />
                      Theme
                    </summary>
                    <ThemeSelectorContent compact />
                  </details>
                </li>
                <li><NavLink to="/settings" className={({ isActive }) => `block text-base py-1.5 hover:text-primary active:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}>Profile</NavLink></li>
                <li><button onClick={logout} className="w-full text-left text-base py-1.5 hover:text-primary active:text-primary bg-transparent border-none cursor-pointer transition-colors">Logout</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
