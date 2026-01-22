import { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HomeIcon, Cog6ToothIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, Cog6ToothIcon as Cog6ToothIconSolid, UserCircleIcon as UserCircleIconSolid } from '@heroicons/react/24/solid';
import { ThemeContext } from '../context/ThemeContext';
import { cn } from '../lib/utils';

const navItems = [
    {
        path: '/dashboard',
        label: 'Home',
        Icon: HomeIcon,
        IconActive: HomeIconSolid
    },
    {
        path: '/profile',
        label: 'Profile',
        Icon: UserCircleIcon,
        IconActive: UserCircleIconSolid
    },
    {
        path: '/settings',
        label: 'Settings',
        Icon: Cog6ToothIcon,
        IconActive: Cog6ToothIconSolid
    },
];

const BottomNav = () => {
    const { darkMode } = useContext(ThemeContext);
    const location = useLocation();

    return (
        <nav className={cn(
            "fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl transition-colors duration-300",
            darkMode
                ? "bg-gray-900/90 border-white/10"
                : "bg-white/90 border-gray-200"
        )}>
            <div className="max-w-lg mx-auto px-4">
                <div className="flex items-center justify-around py-2">
                    {navItems.map(({ path, label, Icon, IconActive }) => {
                        const isActive = location.pathname === path ||
                            (path === '/dashboard' && location.pathname === '/');

                        return (
                            <NavLink
                                key={path}
                                to={path}
                                className={cn(
                                    "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 min-w-[64px]",
                                    isActive
                                        ? darkMode
                                            ? "text-blue-400"
                                            : "text-blue-600"
                                        : darkMode
                                            ? "text-gray-400 hover:text-gray-200"
                                            : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                {isActive ? (
                                    <IconActive className="h-6 w-6" />
                                ) : (
                                    <Icon className="h-6 w-6" />
                                )}
                                <span className={cn(
                                    "text-xs font-medium transition-all duration-300",
                                    isActive && "font-semibold"
                                )}>
                                    {label}
                                </span>
                                {isActive && (
                                    <div className={cn(
                                        "absolute -bottom-2 w-1 h-1 rounded-full",
                                        darkMode ? "bg-blue-400" : "bg-blue-600"
                                    )} />
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </div>

            {/* Safe area for iOS devices */}
            <div className="h-safe-area-inset-bottom" />
        </nav>
    );
};

export default BottomNav;
