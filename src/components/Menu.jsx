import React from 'react';
import { useEffect } from 'react';  
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';  

import SelectorTheme from './SelectorTheme';

export default function Menu() {
    const { isAuthenticated, loginWithRedirect, user, logout } = useAuth0();

    return (
        <div className="navbar bg-base-100">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">Taking Note</a>
            </div>
            <div className="flex-none gap-2">
                <ul className="menu menu-horizontal px-1">
                    <li><Link to="/">All Dreams</Link></li>
                    {isAuthenticated && (
                        <>
                            <li><Link to="/my-dreams">My Dreams</Link></li>
                        </>
                    )}
                </ul>
                {isAuthenticated ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <img
                                    alt="User Avatar"
                                    src={user.picture} />
                            </div>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-vertical align-center dropdown-content bg-base-100 rounded-box z-[1] mt-3 p-2 shadow flex justify-center">
                            <li className="flex justify-center"><Link to="/user">Profile</Link></li>
                            <li className="flex justify-center"><a onClick={() => logout({ returnTo: window.location.origin })}>Logout</a></li>
                            <span className="flex justify-center"><SelectorTheme /></span>
                        </ul>
                    </div>
                ) : (
                    <button onClick={() => loginWithRedirect()} className="btn btn-primary">Log In</button> 
                )}
            </div>
        </div>
    )
}