import { useState, useEffect } from 'react';
import { IoColorPaletteOutline } from "react-icons/io5";
import { themes } from '../utils';

export function ThemeSelectorContent({ onSelect, compact = false }) {
    const [currentTheme, setCurrentTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('dream-speak-theme') || 'light';
        setCurrentTheme(savedTheme);
    }, []);

    const handleThemeChange = (theme) => {
        localStorage.setItem('dream-speak-theme', theme);
        setCurrentTheme(theme);
        document.documentElement.setAttribute('data-theme', theme);
        onSelect?.();
    };

    return (
        <ul className={`grid gap-1 ${compact ? 'grid-cols-1 w-full min-w-0 max-h-64 overflow-y-auto p-2' : 'grid-cols-2 w-36 sm:w-40 max-w-[calc(100vw-2rem)] gap-2 sm:gap-4 p-2'}`}>
            {themes.map((theme) => (
                <li key={theme.name} className="w-full list-none min-w-0">
                    <a
                        onClick={() => handleThemeChange(theme.name)}
                        className={`flex items-center gap-3 rounded cursor-pointer min-w-0 ${compact ? 'p-2' : 'p-2'} ${currentTheme === theme.name ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`}
                    >
                        <span className={`flex-grow font-medium truncate min-w-0 ${compact ? 'text-sm' : 'text-sm'}`}>
                            {theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
                        </span>
                        <span className="flex items-center shrink-0 gap-1 opacity-50">
                            {theme.colors.slice(0, 4).map((color, idx) => (
                                <span key={idx} className={`rounded-full ${compact ? 'w-3 h-3' : 'w-2 h-2'}`} style={{ backgroundColor: color }}></span>
                            ))}
                        </span>
                    </a>
                </li>
            ))}
        </ul>
    );
}

export default function SelectorTheme() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`dropdown dropdown-end ${isOpen ? 'dropdown-open' : ''}`} style={{ zIndex: 9999 }}>
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle relative" onClick={() => setIsOpen(!isOpen)}>
                <IoColorPaletteOutline className="text-xl" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-2 border-base-100"></span>
            </div>
            {isOpen && (
                <div className="dropdown-content overflow-hidden shadow bg-base-100 rounded-box mt-3 z-[9999] animate-theme-dropdown-open origin-right">
                    <ThemeSelectorContent onSelect={() => setIsOpen(false)} compact />
                </div>
            )}
        </div>
    );
}