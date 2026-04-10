"use client"

import React, { useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@mui/material';
import TimeIcon from '@mui/icons-material/AccessTime';
import AlarmsIcon from '@mui/icons-material/Alarm';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import WatchIcon from '@mui/icons-material/Watch';
import { ConnectionContext } from '../_app.page';
import { watchInfo } from '@api/WatchInfo';

export const SIDEBAR_WIDTH = 260;

const NAV_ITEMS = [
    { label: 'Time', icon: TimeIcon, path: '/time/Time' },
    { label: 'Alarms', icon: AlarmsIcon, path: '/alarms/Alarms' },
    { label: 'Events', icon: CalendarIcon, path: '/reminders/Reminders' },
    { label: 'Settings', icon: SettingsIcon, path: '/settings/Settings' },
];

const SideNavigation: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { isConnected } = useContext(ConnectionContext);
    const [visibleItems, setVisibleItems] = useState(NAV_ITEMS);

    useEffect(() => {
        // Only filter based on watch capabilities if a watch is connected
        if (isConnected) {
            if (!watchInfo.hasReminders) {
                setVisibleItems(NAV_ITEMS.filter(item => item.label !== 'Events'));
            } else {
                setVisibleItems(NAV_ITEMS);
            }
        } else {
            // If no watch connected, show all items
            setVisibleItems(NAV_ITEMS);
        }
    }, [isConnected]);

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const isActive = (path: string) => {
        if (path === '/') {
            return pathname === '/';
        }
        return pathname === path;
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: SIDEBAR_WIDTH,
                flexShrink: 0,
                display: { xs: 'none', md: 'block' },
                '& .MuiDrawer-paper': {
                    width: SIDEBAR_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: 'background.paper',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                },
            }}
        >
            {/* App Header / Branding */}
            <Box
                sx={{
                    px: 3,
                    py: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #8B5E3C 0%, #5C3A1E 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                    }}
                >
                    <WatchIcon fontSize="small" />
                </Box>
                <Box>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            lineHeight: 1.2,
                        }}
                    >
                        G-Shock Smaprt Sync
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        Watch Manager
                    </Typography>
                </Box>
            </Box>

            {/* Navigation Items */}
            <Box sx={{ px: 2, py: 2 }}>
                <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {visibleItems.map((item) => {
                        const active = isActive(item.path);
                        const isDisabled = !isConnected;
                        return (
                            <ListItemButton
                                key={item.path}
                                onClick={() => !isDisabled && handleNavigation(item.path)}
                                selected={active}
                                disabled={isDisabled}
                                sx={{
                                    py: 1.5,
                                    px: 2,
                                    borderRadius: '100px',
                                    minHeight: 48,
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(139, 94, 60, 0.12)',
                                        '& .MuiListItemIcon-root': {
                                            color: 'primary.main',
                                        },
                                        '& .MuiListItemText-primary': {
                                            fontWeight: 600,
                                            color: 'primary.main',
                                        },
                                    },
                                    '&.Mui-disabled': {
                                        opacity: 0.5,
                                        backgroundColor: 'transparent',
                                        '& .MuiListItemIcon-root': {
                                            color: 'text.disabled',
                                        },
                                        '& .MuiListItemText-primary': {
                                            color: 'text.disabled',
                                        },
                                        cursor: 'not-allowed',
                                    },
                                    '&:hover:not(.Mui-disabled)': {
                                        backgroundColor: active
                                            ? 'rgba(139, 94, 60, 0.16)'
                                            : 'rgba(139, 94, 60, 0.08)',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 40,
                                        color: isDisabled
                                            ? 'text.disabled'
                                            : active ? 'primary.main' : 'text.secondary',
                                    }}
                                >
                                    <item.icon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: '0.9375rem',
                                        fontWeight: active ? 600 : 500,
                                        color: isDisabled
                                            ? 'text.disabled'
                                            : active ? 'primary.main' : 'text.primary',
                                    }}
                                />
                            </ListItemButton>
                        );
                    })}
                </List>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    mt: 'auto',
                    px: 3,
                    py: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        display: 'block',
                    }}
                >
                    Casio G-Shock
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        opacity: 0.7,
                    }}
                >
                    Web Bluetooth Sync
                </Typography>
            </Box>
        </Drawer>
    );
};

export default SideNavigation;
