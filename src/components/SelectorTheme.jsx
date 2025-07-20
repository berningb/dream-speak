import { useState, useEffect } from 'react';
import { IoColorPaletteOutline } from "react-icons/io5";
import { themes } from '../utils';

export default function SelectorTheme() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState('light');

    // Load saved theme on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('dream-speak-theme') || 'light';
        setCurrentTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const handleThemeChange = (theme) => {
        // Save to localStorage
        localStorage.setItem('dream-speak-theme', theme);
        
        // Update state
        setCurrentTheme(theme);
        
        // Apply to DOM
        document.documentElement.setAttribute('data-theme', theme);
        
        // Close dropdown
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`dropdown dropdown-end ${isOpen ? 'dropdown-open' : ''}`}>
            <button className="btn-ghost btn-circle btn relative" onClick={toggleDropdown}>
                <IoColorPaletteOutline className="text-xl" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-2 border-base-100"></div>
            </button>
            {isOpen && (
                <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-96 grid grid-cols-2 gap-4">
                    {themes.map((theme) => (
                        <li key={theme.name} className="w-full">
                            <a 
                                onClick={() => handleThemeChange(theme.name)} 
                                className={`flex items-center gap-2 p-2 rounded hover:bg-gray-200 ${
                                    currentTheme === theme.name ? 'bg-primary text-primary-content' : ''
                                }`}
                            >
                                <span className="flex-grow text-sm font-medium">
                                    {theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
                                </span>
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