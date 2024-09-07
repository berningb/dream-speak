import React from 'react';
import Menu from './Menu';

export default function Layout({ children }) {
    return (
        <div className="bg-base-100">
            <Menu />
            <div className="content px-8">
                {children}
            </div>
        </div>
    );
}