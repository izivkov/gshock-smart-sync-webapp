import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Snackbar, Alert, Stack, Divider, useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AlarmCard from './AlarmCard';
import AppSwitch from '@components/AppSwitch';
import GShockAPI from '@/api/GShockAPI';
import { actionsContainer, SetAlarmsAction } from '@/actions/ActionsContainer';
import { ComponentId } from '@/session/types';
import { useSessionComponent } from '@/session/useSessionComponent';
import ScreenTitle from '../components/ScreenTitle';

const BOTTOM_NAV_HEIGHT = '80px';

type AlarmData = { hour: number, minute: number, hasHourlyChime: boolean, enabled: boolean };

const Alarms: React.FC = () => {
    const theme = useTheme();
    const { value: alarms, loaded, dirty, edit, load, commit } = useSessionComponent<AlarmData[]>(
        ComponentId.ALARMS,
        Array.from({ length: 5 }, () => ({ hour: 0, minute: 0, hasHourlyChime: false, enabled: false }))
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (loaded) return; // already read in this session; keep any unsaved edits
        let cancelled = false;
        (async () => {
            try {
                const fromWatch = await GShockAPI.getAlarms();
                if (!cancelled) load(Array.isArray(fromWatch) ? fromWatch.slice(0, 5) : []);
            } catch (e) {
                console.error('Failed to fetch alarms', e);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const sendToWatch = async () => {
        try {
            await actionsContainer.getAction(SetAlarmsAction).run(alarms);
            commit(alarms);
        } catch (e) {
            console.error('Failed to send alarms', e);
            setError('Failed to send alarms');
        }
    };

    const onChange = (alarmnumber: 1 | 2 | 3 | 4 | 5, alarm: AlarmData) => {
        edit(prev => prev.map((a, i) => (i === alarmnumber - 1 ? { ...a, ...alarm } : a)));
    };

    const onSignalChange = (checked: boolean) => {
        edit(prev => prev.map(a => ({ ...a, hasHourlyChime: checked })));
    };

    if (!alarms || alarms.length === 0) {
        return <Typography variant="h6" sx={{ p: 4, textAlign: 'center' }}>No alarms found</Typography>;
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
                    <ScreenTitle title="Alarms" />

                    <Stack spacing={1} sx={{ mt: 1 }}>
                        {alarms.map((alarm, index) => (
                            <AlarmCard
                                key={index}
                                number={(index + 1) as 1 | 2 | 3 | 4 | 5}
                                alarm={alarm}
                                onChange={onChange}
                            />
                        ))}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, mb: 4 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Signal (chime)
                        </Typography>
                        <AppSwitch text="" initialValue={alarms[0].hasHourlyChime} onChange={onSignalChange} />
                    </Box>
                </Box>
            </Box>

            {/* 2. FIXED BOTTOM BUTTON AREA */}
            <Box sx={{
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                pb: { xs: `calc(env(safe-area-inset-bottom) + 8px)`, md: 2 },
                zIndex: 10,
                boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
                display: 'flex',
                justifyContent: 'center',
                gap: 2
            }}>
                <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 600 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={sendToWatch}
                        startIcon={<SendIcon />}
                        disabled={!dirty}
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

export default Alarms;
