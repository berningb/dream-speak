import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

import SelectorTheme from './SelectorTheme'
import { useBackendUser } from '../hooks/useUsers.jsx'

export default function Menu () {
  const { isAuthenticated, loginWithRedirect } = useAuth0()
  const { backendUser } = useBackendUser()

  return (
    <div className='navbar bg-base-100'>
      <div className='flex-1'>
        <Link to='/'>DreamSpeak</Link>
      </div>
      <div className='flex-none gap-2'>
        <ul className='menu menu-horizontal px-1'>
          <li>
            <Link to='/all-dreams'>All Dreams</Link>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <Link to='/my-dreams'>My Dreams</Link>
              </li>
              <li>
                <Link to='/reflections'>Reflections</Link>
              </li>
            </>
          )}
        </ul>
        {isAuthenticated ? (
          <div className='dropdown dropdown-end'>
            <div
              tabIndex={0}
              role='button'
              className='btn btn-ghost btn-circle avatar'
            >
              <div className='w-10 rounded-full'>
                {backendUser === null ? (
                  <span className='loading loading-spinner loading-md'></span>
                ) : (
                  <img
                    alt='User Avatar'
                    src={backendUser.picture || '/default-avatar.png'}
                    onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                  />
                )}
              </div>
            </div>
            <ul
              tabIndex={0}
              className='menu menu-vertical align-center dropdown-content bg-base-100 rounded-box z-[1] mt-3 p-2 shadow flex justify-center'
            >
              <li className='flex justify-center'>
                <Link to='/user'>Profile</Link>
              </li>
              <li className='flex justify-center'>
                <Link to='/logout'>Logout</Link>
              </li>
              <span className='flex justify-center'>
                <SelectorTheme />
              </span>
            </ul>
          </div>
        ) : (
          <button
            onClick={() => loginWithRedirect()}
            className='btn btn-primary'
          >
            Log In
          </button>
        )}
      </div>
    </div>
  )
}
