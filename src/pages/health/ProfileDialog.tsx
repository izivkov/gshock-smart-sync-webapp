import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Stack,
    CircularProgress,
} from '@mui/material';
import { ExerciseProfile, isImperialLocale, CM_PER_INCH, KG_PER_POUND } from '@model/ExerciseProfile';

interface ProfileDialogProps {
    open: boolean;
    onClose: () => void;
    currentProfile: ExerciseProfile;
    onSave: (profile: ExerciseProfile) => Promise<boolean>;
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({
    open,
    onClose,
    currentProfile,
    onSave,
}) => {
    const imperialLocale = isImperialLocale();
    const [stepGoalText, setStepGoalText] = useState('');
    const [heightText, setHeightText] = useState('');
    const [weightText, setWeightText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [initial, setInitial] = useState({ stepGoal: '', height: '', weight: '' });
    const dirty = stepGoalText !== initial.stepGoal || heightText !== initial.height || weightText !== initial.weight;

    useEffect(() => {
        if (open) {
            const stepGoal = currentProfile.stepGoal.toString();
            const height = (imperialLocale ? Math.round(currentProfile.height / CM_PER_INCH) : Math.round(currentProfile.height)).toString();
            const weight = (imperialLocale ? Math.round(currentProfile.weight / KG_PER_POUND) : Math.round(currentProfile.weight)).toString();
            setStepGoalText(stepGoal);
            setHeightText(height);
            setWeightText(weight);
            setInitial({ stepGoal, height, weight });
            setError(null);
        }
    }, [open, currentProfile, imperialLocale]);

    const labelHeight = imperialLocale ? 'Height (in)' : 'Height (cm)';
    const labelWeight = imperialLocale ? 'Weight (lb)' : 'Weight (kg)';

    const handleSave = async () => {
        const parsedStepGoal = parseInt(stepGoalText, 10);
        const parsedHeight = parseInt(heightText, 10);
        const parsedWeight = parseInt(weightText, 10);

        if (isNaN(parsedStepGoal)) {
            setError('Step goal must be a number.');
            return;
        }
        if (isNaN(parsedHeight)) {
            setError('Height must be a number.');
            return;
        }
        if (isNaN(parsedWeight)) {
            setError('Weight must be a number.');
            return;
        }

        if (parsedStepGoal < 1000 || parsedStepGoal > 30000) {
            setError('Step goal must be between 1000 and 30000.');
            return;
        }

        const minHeight = imperialLocale ? 20 : 50;
        const maxHeight = imperialLocale ? 120 : 250;
        if (parsedHeight < minHeight || parsedHeight > maxHeight) {
            setError(
                imperialLocale
                    ? 'Height must be between 20 and 120 in.'
                    : 'Height must be between 50 and 250 cm.'
            );
            return;
        }

        const minWeight = imperialLocale ? 44 : 20;
        const maxWeight = imperialLocale ? 660 : 300;
        if (parsedWeight < minWeight || parsedWeight > maxWeight) {
            setError(
                imperialLocale
                    ? 'Weight must be between 44 and 660 lb.'
                    : 'Weight must be between 20 and 300 kg.'
            );
            return;
        }

        const metricHeight = imperialLocale ? Math.round(parsedHeight * CM_PER_INCH) : parsedHeight;
        const metricWeight = imperialLocale ? Math.round(parsedWeight * KG_PER_POUND) : parsedWeight;

        setSaving(true);
        const success = await onSave({
            stepGoal: parsedStepGoal,
            height: metricHeight,
            weight: metricWeight,
        });
        setSaving(false);

        if (success) {
            onClose();
        } else {
            setError('Unable to save exercise profile to watch.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700, color: '#2D1A0E' }}>
                Exercise Profile
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Set step goal, height, and weight for your watch.
                </Typography>

                <Stack spacing={2}>
                    <TextField
                        label="Step Goal"
                        type="number"
                        value={stepGoalText}
                        onChange={(e) => {
                            setStepGoalText(e.target.value);
                            setError(null);
                        }}
                        fullWidth
                        size="small"
                    />

                    <Stack direction="row" spacing={1.5}>
                        <TextField
                            label={labelHeight}
                            type="number"
                            value={heightText}
                            onChange={(e) => {
                                setHeightText(e.target.value);
                                setError(null);
                            }}
                            fullWidth
                            size="small"
                        />

                        <TextField
                            label={labelWeight}
                            type="number"
                            value={weightText}
                            onChange={(e) => {
                                setWeightText(e.target.value);
                                setError(null);
                            }}
                            fullWidth
                            size="small"
                        />
                    </Stack>

                    {error && (
                        <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                            {error}
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={saving} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={saving || !dirty}
                    variant="contained"
                    sx={{
                        borderRadius: 100,
                        px: 3,
                    }}
                >
                    {saving ? <CircularProgress size={20} color="inherit" /> : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProfileDialog;
