import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Button, Snackbar, Alert, Stack } from '@mui/material';
import ScreenTitle from '../components/ScreenTitle';
import StepCounterView from './StepCounterView';
import ProfileDialog from './ProfileDialog';

import { StepCounterData } from '@model/StepCounterData';
import { ExerciseProfile, defaultExerciseProfile } from '@model/ExerciseProfile';
import { ConnectionContext } from '@/App';
import { watchInfo } from '@/api/WatchInfo';
import { sessionManager } from '@/session/SessionManager';
import { ComponentId } from '@/session/types';
import { ChangeTracker } from '@/utils/ChangeTracker';
import { actionsContainer } from '@/actions/ActionsContainer';
import { SetExerciseProfileAction } from '@/actions/SetExerciseProfileAction';

const BOTTOM_NAV_HEIGHT = '80px';

const Health: React.FC = () => {
    const { isConnected } = useContext(ConnectionContext);
    const [session] = useState(() => sessionManager.getCurrentSession());
    const profileTracker = new ChangeTracker<ExerciseProfile>(ComponentId.HEALTH_PROFILE);
    const isPending = session?.snapshot?.pendingSaves?.has(ComponentId.HEALTH_PROFILE) ?? false;
    const [stepData, setStepData] = useState<StepCounterData>(StepCounterData.unavailable());
    const [profile, setProfile] = useState<ExerciseProfile>(defaultExerciseProfile());
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    const refreshHealthData = useCallback(async () => {
        if (!isConnected) return;

        try {
            if (watchInfo.hasExerciseProfile) {
                const exProfile = await GShockAPI.getExerciseProfile();
                setProfile(exProfile);
            }

            if (watchInfo.hasStepCounter || watchInfo.hasStepCounterMock) {
                const steps = await GShockAPI.getStepCount(true);
                setStepData(steps);
            }
        } catch (error) {
            console.warn('Failed to refresh health data:', error);
        }
    }, [isConnected]);

    useEffect(() => {
        if (isConnected) {
            refreshHealthData();
        }
    }, [isConnected, refreshHealthData]);

    const handleSaveProfile = async (updatedProfile: ExerciseProfile): Promise<boolean> => {
        try {
            await actionsContainer.getAction(SetExerciseProfileAction).run(updatedProfile);
            setProfile(updatedProfile);
            profileTracker.setBaseline(updatedProfile);
            setSnackbarMessage('Exercise profile saved to watch.');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            return true;
        } catch (error) {
            console.error('Failed to save exercise profile:', error);
            setSnackbarMessage('Unable to save exercise profile to watch.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return false;
        }
    };

    return (
        <Box
            sx={{
                width: '100%',
                height: { xs: '100dvh', md: '100%' },
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                bgcolor: 'background.default',
                pb: { xs: BOTTOM_NAV_HEIGHT, md: 0 },
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    px: { xs: 1.5, sm: 3, md: 4 },
                    pt: 2,
                    pb: 2,
                }}
            >
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    <ScreenTitle title="Health" />

                    <Stack spacing={2} sx={{ width: '100%' }}>
                        <StepCounterView stepData={stepData} profile={profile} />

                        <Button
                            variant="contained"
                            onClick={() => setShowProfileDialog(true)}
                            fullWidth disabled={!sessionManager.getPendingComponents().includes(ComponentId.HEALTH_PROFILE)}
                            sx={{
                                borderRadius: 100,
                                py: 1.5,
                                fontWeight: 600,
                            }}
                        >
                            Profile
                        </Button>
                    </Stack>
                </Box>
            </Box>

            <ProfileDialog
                open={showProfileDialog}
                onClose={() => setShowProfileDialog(false)}
                currentProfile={profile}
                onSave={handleSaveProfile}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Health;
