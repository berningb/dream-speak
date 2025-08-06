import { useFirebaseAuth } from '../contexts/FirebaseAuthContext'
import SelectorTheme from './SelectorTheme'

export default function Menu() {
  const { isAuthenticated, loginWithGoogle, user } = useFirebaseAuth()

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><a href="/">Home</a></li>
            <li><a href="/my-dreams">My Dreams</a></li>
            <li><a href="/explore">Explore</a></li>
            <li><a href="/reflections">Reflections</a></li>
            <li><a href="/connections">Connections</a></li>
            <li><a href="/settings">Settings</a></li>
          </ul>
        </div>
        <a href="/" className="btn btn-ghost text-xl">
          <span className="text-2xl">🌙</span>
          <span className="ml-2">DreamSpeak</span>
        </a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><a href="/">Home</a></li>
          <li><a href="/my-dreams">My Dreams</a></li>
          <li><a href="/explore">Explore</a></li>
          <li><a href="/reflections">Reflections</a></li>
          <li><a href="/connections">Connections</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </div>
      <div className="navbar-end">
        <div className="flex items-center gap-2">
          <SelectorTheme />
          {!isAuthenticated ? (
            <button className="btn btn-primary" onClick={loginWithGoogle}>
              Sign In
            </button>
          ) : (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img 
                    alt="Profile" 
                    src={user?.photoURL || '/default-avatar.png'}
                  />
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li><a href="/settings">Profile</a></li>
                <li><a href="/logout">Logout</a></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
