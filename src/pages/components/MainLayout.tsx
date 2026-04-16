"use client"

import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    Box,
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import TimeIcon from '@mui/icons-material/AccessTime';
import AlarmsIcon from '@mui/icons-material/Alarm';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import SideNavigation, { SIDEBAR_WIDTH } from './SideNavigation';
import { ConnectionContext } from '../_app.page';
import { watchInfo } from '@api/WatchInfo';

interface MainLayoutProps {
    children: ReactNode;
}

const NAV_ITEMS = [
    { label: 'Time', icon: <TimeIcon />, path: '/time/Time' },
    { label: 'Alarms', icon: <AlarmsIcon />, path: '/alarms/Alarms' },
    { label: 'Events', icon: <CalendarIcon />, path: '/reminders/Reminders' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings/Settings' },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const { isConnected } = useContext(ConnectionContext);
    const visibleItems = React.useMemo(() => {
        if (isConnected && !watchInfo.hasReminders) {
            return NAV_ITEMS.filter(item => item.label !== 'Events');
        }
        return NAV_ITEMS;
    }, [isConnected]);

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const currentTabIndex = (() => {
        const idx = visibleItems.findIndex(item => item.path === pathname);
        if (idx !== -1) return idx;
        return 0;
    })();

    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                bgcolor: 'background.default',
            }}
        >
            {/* Desktop Side Navigation */}
            {isDesktop && <SideNavigation />}

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
                    pb: { xs: '88px', md: 0 },
                    transition: theme.transitions.create(['margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                {children}
            </Box>

            {/* Mobile Bottom Navigation — only visible on mobile */}
            {!isDesktop && (
                <Paper
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1200,
                        borderRadius: 0,
                        boxShadow: '0 -1px 8px rgba(139, 94, 60, 0.12)',
                        bgcolor: 'background.paper',
                    }}
                    elevation={0}
                >
                    <BottomNavigation
                        showLabels
                        value={currentTabIndex}
                        onChange={(_, newValue) => {
                            if (isConnected) {
                                handleNavigation(visibleItems[newValue].path);
                            }
                        }}
                        sx={{
                            height: 80,
                            bgcolor: 'transparent',
                            '& .MuiBottomNavigationAction-root': {
                                py: 1.5,
                                minWidth: 0,
                                gap: 0.5,
                            },
                        }}
                    >
                        {visibleItems.map((item) => (
                            <BottomNavigationAction
                                key={item.path}
                                label={item.label}
                                disabled={!isConnected}
                                icon={
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 64,
                                            height: 32,
                                            borderRadius: '100px',
                                            bgcolor: currentTabIndex === visibleItems.findIndex(i => i.path === item.path) && isConnected
                                                ? 'rgba(139, 94, 60, 0.12)'
                                                : 'transparent',
                                            transition: 'background-color 0.2s ease',
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                }
                                sx={{
                                    color: 'text.secondary',
                                    '&.Mui-selected': {
                                        color: 'primary.main',
                                    },
                                    '&.Mui-disabled': {
                                        color: 'text.disabled',
                                    },
                                    '& .MuiBottomNavigationAction-label': {
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        mt: 0.25,
                                        '&.Mui-selected': {
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                        },
                                        '&.Mui-disabled': {
                                            color: 'text.disabled',
                                        },
                                    },
                                }}
                            />
                        ))}
                    </BottomNavigation>
                </Paper>
            )}
        </Box>
    );
};

export default MainLayout;
