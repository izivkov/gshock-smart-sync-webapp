import React, { useEffect, useState } from 'react';
import {
    Box, Button, Snackbar, Alert, Stack, useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReminderCard from './ReminderCard';
import GShockAPI from '@/api/GShockAPI';
import { actionsContainer, SetRemindersAction } from '@/actions/ActionsContainer';
import ScreenTitle from '../components/ScreenTitle';
import ReminderData, { monthType, repeatPeriodType } from './ReminderData';
import { ComponentId } from '@/session/types';
import { useSessionComponent } from '@/session/useSessionComponent';

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
    const { value: reminders, loaded, dirty, edit, load, commit } = useSessionComponent<ReminderData[]>(
        ComponentId.EVENTS,
        initialReminders
    );
    const [error, setError] = useState<string | null>(null);

    const readFromWatch = async (): Promise<ReminderData[]> =>
        (await GShockAPI.getEventsFromWatch()).slice(0, 5);

    useEffect(() => {
        if (loaded) return; // already read in this session; keep any unsaved edits
        let cancelled = false;
        (async () => {
            try {
                const fromWatch = await readFromWatch();
                if (!cancelled) load(fromWatch);
            } catch (e) {
                console.error('Failed to fetch events:', e);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const sendToWatch = async () => {
        try {
            await actionsContainer.getAction(SetRemindersAction).run(reminders);
            commit(reminders);
        } catch (e) {
            console.error('Failed to send events:', e);
            setError('Failed to send events');
            return;
        }
        try {
            commit(await readFromWatch()); // re-read what the watch actually stored
        } catch (e) {
            console.error('Failed to re-read events:', e);
        }
    };

    const onChange = (reminder: ReminderData, number: 1 | 2 | 3 | 4 | 5) => {
        edit(prev => {
            const next = [...prev];
            next[number - 1] = reminder;
            return next;
        });
    };

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
                        disabled={!dirty}
                        startIcon={<SendIcon />}
                        sx={{ borderRadius: 100, py: 1.2, fontWeight: 600, textTransform: 'none', boxShadow: '0 2px 8px rgba(139, 94, 60, 0.25)' }}
                    >
                        Send to Watch
                    </Button>
                </Box>
            </Box>

            <Snackbar
                open={error !== null}
                autoHideDuration={3000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error" variant="filled" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Reminders;
