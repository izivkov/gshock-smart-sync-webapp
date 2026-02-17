"use client"

import React, { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    BottomNavigation,
    BottomNavigationAction,
    useTheme,
    useMediaQuery,
    Container,
    Avatar,
    Paper,
    Fade,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TimeIcon from '@mui/icons-material/AccessTime';
import AlarmsIcon from '@mui/icons-material/Alarm';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';

interface MainLayoutProps {
    children: ReactNode;
}

const NAV_ITEMS = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Time', icon: <TimeIcon />, path: '/time/Time' },
    { label: 'Alarms', icon: <AlarmsIcon />, path: '/alarms/Alarms' },
    { label: 'Reminders', icon: <CalendarIcon />, path: '/reminders/Reminders' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings/Settings' },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleNavigation = (path: string) => {
        router.push(path);
        setDrawerOpen(false);
    };

    const currentTabIndex = NAV_ITEMS.findIndex(item => item.path === pathname);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'text.primary'
                }}
            >
                <Toolbar>
                    {!isMobile && (
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={() => setDrawerOpen(true)}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Avatar
                        src="/logo.png"
                        sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}
                    >
                        G
                    </Avatar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 0.5 }}>
                        G-Shock Smart Sync
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Side Drawer (Desktop) */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        width: 280,
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(20px)',
                    }
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', px: 2 }}>
                        Navigation
                    </Typography>
                    <List>
                        {NAV_ITEMS.map((item) => (
                            <ListItem key={item.path} disablePadding>
                                <ListItemButton
                                    onClick={() => handleNavigation(item.path)}
                                    selected={pathname === item.path}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.5,
                                        mx: 1,
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.light',
                                            color: 'primary.contrastText',
                                            '& .MuiListItemIcon-root': {
                                                color: 'inherit',
                                            }
                                        }
                                    }}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    pb: isMobile ? 8 : 0, // Space for bottom navigation
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Fade in timeout={500}>
                    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                        {children}
                    </Container>
                </Fade>
            </Box>

            {/* Bottom Navigation (Mobile) */}
            {isMobile && (
                <Paper
                    sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
                    elevation={3}
                >
                    <BottomNavigation
                        showLabels
                        value={currentTabIndex !== -1 ? currentTabIndex : 0}
                        onChange={(_, newValue) => {
                            handleNavigation(NAV_ITEMS[newValue].path);
                        }}
                        sx={{
                            height: 70,
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        {NAV_ITEMS.slice(1).map((item) => (
                            <BottomNavigationAction
                                key={item.path}
                                label={item.label}
                                icon={item.icon}
                            />
                        ))}
                        <BottomNavigationAction
                            label="Home"
                            icon={<HomeIcon />}
                            onClick={() => handleNavigation('/')}
                        />
                    </BottomNavigation>
                </Paper>
            )}
        </Box>
    );
};

export default MainLayout;
