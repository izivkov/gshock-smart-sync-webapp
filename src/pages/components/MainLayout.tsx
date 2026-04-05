"use client"

import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';

import {
    Box,
    BottomNavigation,
    BottomNavigationAction,
    Paper,
} from '@mui/material';
import TimeIcon from '@mui/icons-material/AccessTime';
import AlarmsIcon from '@mui/icons-material/Alarm';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SettingsIcon from '@mui/icons-material/Settings';

interface MainLayoutProps {
    children: ReactNode;
}

const NAV_ITEMS = [
    { label: 'Time', icon: <TimeIcon />, path: '/time/Time' },
    { label: 'Alarms', icon: <AlarmsIcon />, path: '/alarms/Alarms' },
    { label: 'Events', icon: <CalendarIcon />, path: '/reminders/Reminders' },
    { label: 'Actions', icon: <DirectionsRunIcon />, path: '/' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings/Settings' },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const router = useRouter();
    const pathname = router.pathname; // Use router.pathname instead of usePathname()

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const currentTabIndex = (() => {
        // Matches the logic you had, but using the correct pathname source
        const idx = NAV_ITEMS.findIndex(item => item.path === pathname);
        if (idx !== -1) return idx;
        return 3; // Default to Actions
    })();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Main Content — padded to clear bottom nav */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    pb: '70px',          // always leave room for bottom nav
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {children}
            </Box>

            {/* Bottom Navigation — always visible, matches Android */}
            <Paper
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1200,
                    borderRadius: 0,
                    boxShadow: '0 -1px 8px rgba(139, 94, 60, 0.12)',
                }}
                elevation={0}
            >
                <BottomNavigation
                    showLabels
                    value={currentTabIndex}
                    onChange={(_, newValue) => {
                        handleNavigation(NAV_ITEMS[newValue].path);
                    }}
                    sx={{ height: 70 }}
                >
                    {NAV_ITEMS.map((item) => (
                        <BottomNavigationAction
                            key={item.path}
                            label={item.label}
                            icon={item.icon}
                            sx={{
                                minWidth: 0,
                                '&.Mui-selected': {
                                    '& .MuiBottomNavigationAction-label': {
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                    },
                                },
                            }}
                        />
                    ))}
                </BottomNavigation>
            </Paper>
        </Box>
    );
};

export default MainLayout;
