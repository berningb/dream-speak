import React, { useState } from 'react';
import { IoColorPaletteOutline } from "react-icons/io5";
import { themes } from '../utils';

export default function SelectorTheme() {
    const [isOpen, setIsOpen] = useState(false);

    const handleThemeChange = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`dropdown dropdown-end ${isOpen ? 'dropdown-open' : ''}`}>
            <button className="btn-ghost btn-circle btn" onClick={toggleDropdown}>
                <IoColorPaletteOutline className="text-xl" />
            </button>
            {isOpen && (
                <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-96 grid grid-cols-2 gap-4">
                    {themes.map((theme) => (
                        <li key={theme.name} className="w-full">
                            <a onClick={() => handleThemeChange(theme.name)} className="flex items-center gap-2 p-2 rounded hover:bg-gray-200">
                                <span className="flex-grow text-sm font-medium">{theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}</span>
                                <span className="flex items-center h-full shrink-0 flex-wrap gap-1">
                                    {theme.colors.map((color, idx) => (
                                        <span key={idx} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                                    ))}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}