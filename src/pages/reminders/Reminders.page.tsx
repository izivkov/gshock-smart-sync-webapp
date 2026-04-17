"use client"

import React, { useEffect, useState } from 'react';
import {
    Box, Button, Snackbar, Alert, Stack, useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReminderCard from './ReminderCard';
import GShockAPI from '@/api/GShockAPI';
import ScreenTitle from '../components/ScreenTitle';
import ReminderData, { monthType, repeatPeriodType } from './ReminderData';

const BOTTOM_NAV_HEIGHT = '80px';

const Reminders: React.FC = () => {
    const theme = useTheme();
    const reminderInit = {
        daysOfWeek: [],
        enabled: false,
        endDate: null,
        startDate: { year: 2000, month: 'JANUARY' as monthType, day: 1 },
        incompatible: false,
        repeatPeriod: 'NEVER' as repeatPeriodType,
        occurrences: 0,
        title: ''
    }

    const initialReminders = Array.from({ length: 5 }, () => ({ ...reminderInit }));
    const [reminders, setReminders] = useState<ReminderData[]>(initialReminders);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    useEffect(() => {
        (async () => {
            try {
                const newReminders = await GShockAPI.getEventsFromWatch();
                setReminders(newReminders.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch events:", error);
            }
        })();
    }, []);

    const sendToWatch = async () => {
        try {
            await GShockAPI.setEvents(reminders);
            setSnackbarMessage('Events sent to watch');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);

            const newReminders = await GShockAPI.getEventsFromWatch();
            setReminders(newReminders.slice(0, 5));
        } catch (error) {
            setSnackbarMessage('Failed to send events');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    }

    const onChange = (reminder: ReminderData, number: 1 | 2 | 3 | 4 | 5) => {
        const newReminders = [...reminders];
        newReminders[number - 1] = reminder;
        setReminders(newReminders);
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            width: '100%',
            overflow: 'hidden',
            bgcolor: 'background.default'
        }}>
            {/* 1. SCROLLABLE CONTENT AREA */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                px: { xs: 1.5, sm: 3, md: 4 },
                pt: 2,
                pb: 2
            }}>
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    <ScreenTitle title="Events" />

                    <Stack spacing={1} sx={{ mt: 1 }}>
                        {reminders.map((reminder, index) => (
                            <ReminderCard
                                key={index}
                                number={(index + 1) as 1 | 2 | 3 | 4 | 5}
                                initialReminder={reminder}
                                onChange={onChange}
                            />
                        ))}
                    </Stack>

                    {/* Visual buffer for the bottom of the list */}
                    <Box sx={{ height: 40 }} />
                </Box>
            </Box>

            {/* 2. RESPONSIVE BOTTOM BUTTON AREA */}
            <Box sx={{
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                pb: { xs: `calc(env(safe-area-inset-bottom) + 8px)`, md: 2 },
                zIndex: 10,
                boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <Box sx={{ width: '100%', maxWidth: 600 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={sendToWatch}
                        startIcon={<SendIcon />}
                        sx={{ borderRadius: 100, py: 1.2, fontWeight: 600, textTransform: 'none', boxShadow: '0 2px 8px rgba(139, 94, 60, 0.25)' }}
                    >
                        Send to Watch
                    </Button>
                </Box>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Reminders;
