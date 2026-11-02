import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    MenuItem,
    Select,
    useTheme,
    Slider,
    Link,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import PeachCard from '../components/PeachCard';
import { StepCounterData } from '@model/StepCounterData';
import { ExerciseProfile, normalizeExerciseProfile } from '@model/ExerciseProfile';

export enum StepDataOption {
    TODAY = 'Today',
    HOURLY = 'Hourly',
    DAILY = 'Daily',
}

interface StepCounterViewProps {
    stepData: StepCounterData;
    profile: ExerciseProfile;
    distanceKm: number;
    calories: number;
    onUpdateProfile: (profile: ExerciseProfile) => void;
    onClearHistory: () => void;
}

/** Slider ranges in the profile's own units. */
const HEIGHT_RANGE = {
    metric: { min: 80, max: 220 },
    imperial: { min: 30, max: 90 },
} as const;

const WEIGHT_RANGE = {
    metric: { min: 20, max: 180 },
    imperial: { min: 40, max: 400 },
} as const;

const StepCounterView: React.FC<StepCounterViewProps> = ({
    stepData,
    profile,
    distanceKm,
    calories,
    onUpdateProfile,
    onClearHistory,
}) => {
    const [selectedOption, setSelectedOption] = useState<StepDataOption>(StepDataOption.TODAY);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [draftProfile, setDraftProfile] = useState<ExerciseProfile>(profile);
    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;
    const surfaceVariantColor = alpha(primaryColor, 0.12);
    const textColor = theme.palette.text.primary;
    const secondaryTextColor = theme.palette.text.secondary;

    useEffect(() => {
        setDraftProfile(profile);
    }, [profile]);

    const units = profile.units;
    const weightUnit = units === 'imperial' ? 'lb' : 'kg';
    const heightUnit = units === 'imperial' ? 'in' : 'cm';
    const displayWeight = Math.round(profile.weight);
    const displayHeight = Math.round(profile.height);

    const openProfileDialog = () => {
        setDraftProfile(profile);
        setShowProfileDialog(true);
    };

    const renderToday = () => {
        const currentSteps = stepData.currentDaySteps ?? 0;
        const progress = Math.min(currentSteps / (profile.stepGoal || 1), 1);

        const strokeWidth = 12;
        const radius = 60;
        const circumference = Math.PI * radius;
        const offset = circumference * (1 - progress);

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                <Box sx={{ width: '40%', pr: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B5E3C' }}>
                        Goal: {profile.stepGoal.toLocaleString()}
                    </Typography>
                    <Slider
                        value={profile.stepGoal}
                        min={1000}
                        max={30000}
                        step={100}
                        onChange={(_, newValue) => {
                            onUpdateProfile({ ...profile, stepGoal: Number(newValue) });
                        }}
                        sx={{ mt: 1, py: 1 }}
                    />
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={openProfileDialog}
                            sx={{ fontWeight: 700, color: primaryColor, textDecoration: 'none', textAlign: 'left' }}
                        >
                            Profile: {displayWeight} {weightUnit}
                        </Link>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={openProfileDialog}
                            sx={{ fontWeight: 700, color: primaryColor, textDecoration: 'none', textAlign: 'left' }}
                        >
                            Height: {displayHeight} {heightUnit}
                        </Link>
                    </Box>
                </Box>

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ position: 'relative', width: 140, height: 80 }}>
                        <svg width="140" height="80" viewBox="0 0 140 80">
                            <path
                                d="M 10 70 A 60 60 0 0 1 130 70"
                                fill="none"
                                stroke={surfaceVariantColor}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                            />
                            <path
                                d="M 10 70 A 60 60 0 0 1 130 70"
                                fill="none"
                                stroke={primaryColor}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                            />
                        </svg>
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}>
                            <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: textColor, lineHeight: 1 }}>
                                {currentSteps.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                steps
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            {distanceKm.toFixed(1)} km
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            {Math.round(calories)} kcal
                        </Typography>
                    </Box>
                    <Box sx={{ width: '100%', mt: 1.5 }}>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={openProfileDialog}
                            sx={{
                                minWidth: 0,
                                px: 1,
                                py: 0.25,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: primaryColor,
                                borderColor: alpha(primaryColor, 0.45),
                                textTransform: 'none',
                            }}
                        >
                            Profile
                        </Button>
                    </Box>
                </Box>
            </Box>
        );
    };

    const renderHourly = () => {
        const rawHourly = stepData.hourlySteps.filter((s): s is number => s !== null);
        const hourly = rawHourly.slice(-10);

        if (hourly.length === 0 || hourly.every((s) => s === 0)) {
            return (
                <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No history</Typography>
                </Box>
            );
        }

        const maxSteps = Math.max(...hourly, 1);
        const chartHeight = 60;
        const barWidth = 14;
        const spacing = 4;

        const now = new Date();
        const labels = hourly.map((_, i) => {
            const d = new Date(now.getTime() - (hourly.length - 1 - i) * 60 * 60000);
            const hour = d.getHours();
            const displayHour = hour % 12 || 12;
            const amPm = hour >= 12 ? 'p' : 'a';
            return `${displayHour}${amPm}`;
        });

        return (
            <Box sx={{ height: 110, width: '100%', pt: 2 }}>
                <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
                    {hourly.map((steps, i) => {
                        const h = (steps / maxSteps) * chartHeight;
                        const x = 10 + i * (barWidth + spacing);
                        const y = 80 - h;
                        return (
                            <g key={i}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={Math.max(h, 2)}
                                    rx={2}
                                    fill={primaryColor}
                                />
                                <text x={x + barWidth / 2} y={y - 4} fontSize="7" textAnchor="middle" fill={textColor} fontWeight="700">
                                    {steps > 999 ? `${(steps / 1000).toFixed(1)}k` : steps}
                                </text>
                                <text x={x + barWidth / 2} y={92} fontSize="7" textAnchor="middle" fill={secondaryTextColor} fontWeight="500">
                                    {labels[i]}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </Box>
        );
    };

    const renderDaily = () => {
        const dailyHistory = (stepData.dailyHistory || []).filter((s): s is number => s !== null);
        const todaySteps = stepData.currentDaySteps ?? 0;
        const daily = [...dailyHistory.slice(-6), todaySteps];

        const maxSteps = Math.max(...daily, 1);
        const barWidth = 18;
        const spacing = 8;
        const chartHeight = 60;

        const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        const now = new Date();
        const labels = daily.map((_, i) => {
            const d = new Date(now.getTime());
            d.setDate(now.getDate() - (daily.length - 1 - i));
            return dayLabels[d.getDay()];
        });

        return (
            <Box sx={{ height: 110, width: '100%', pt: 2 }}>
                <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
                    {daily.map((steps, i) => {
                        const h = (steps / maxSteps) * chartHeight;
                        const x = 15 + i * (barWidth + spacing);
                        const y = 80 - h;
                        return (
                            <g key={i}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={Math.max(h, 2)}
                                    rx={2}
                                    fill={primaryColor}
                                />
                                <text x={x + barWidth / 2} y={y - 4} fontSize="8" textAnchor="middle" fill={textColor} fontWeight="700">
                                    {steps > 999 ? `${(steps / 1000).toFixed(1)}k` : steps}
                                </text>
                                <text x={x + barWidth / 2} y={92} fontSize="8" textAnchor="middle" fill={secondaryTextColor} fontWeight="500">
                                    {labels[i]}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </Box>
        );
    };

    return (
        <PeachCard sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        Activity
                    </Typography>
                </Box>
                <Select
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value as StepDataOption)}
                    size="small"
                    variant="standard"
                    disableUnderline
                    sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: '#2D1A0E',
                        '& .MuiSelect-select': { py: 0, pr: '20px !important' },
                    }}
                >
                    {Object.values(StepDataOption).map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </Box>

            <Box sx={{ minHeight: 110 }}>
                {selectedOption === StepDataOption.TODAY && renderToday()}
                {selectedOption === StepDataOption.HOURLY && renderHourly()}
                {selectedOption === StepDataOption.DAILY && renderDaily()}
            </Box>

            <Dialog open={showProfileDialog} onClose={() => setShowProfileDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle>Exercise Profile</DialogTitle>
                <DialogContent>
                    <Box sx={{ py: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                            Units: {units === 'metric' ? 'Metric' : 'Imperial'}
                        </Typography>

                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                            Step Goal: {draftProfile.stepGoal.toLocaleString()}
                        </Typography>
                        <Slider
                            value={draftProfile.stepGoal}
                            min={1000}
                            max={30000}
                            step={100}
                            onChange={(_, value) => setDraftProfile((current) => ({ ...current, stepGoal: Number(value) }))}
                            sx={{ mb: 2 }}
                        />

                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                            Height: {Math.round(draftProfile.height)} {heightUnit}
                        </Typography>
                        <Slider
                            value={Math.round(draftProfile.height)}
                            min={HEIGHT_RANGE[units].min}
                            max={HEIGHT_RANGE[units].max}
                            step={1}
                            onChange={(_, value) => {
                                setDraftProfile((current) => ({ ...current, height: Number(value) }));
                            }}
                            sx={{ mb: 2 }}
                        />

                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                            Weight: {Math.round(draftProfile.weight)} {weightUnit}
                        </Typography>
                        <Slider
                            value={Math.round(draftProfile.weight)}
                            min={WEIGHT_RANGE[units].min}
                            max={WEIGHT_RANGE[units].max}
                            step={1}
                            onChange={(_, value) => {
                                setDraftProfile((current) => ({ ...current, weight: Number(value) }));
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowProfileDialog(false)}>Cancel</Button>
                    <Button
                        onClick={() => {
                            onUpdateProfile(normalizeExerciseProfile(draftProfile));
                            setShowProfileDialog(false);
                        }}
                        variant="contained"
                        color="primary"
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </PeachCard>
    );
};

export default StepCounterView;
