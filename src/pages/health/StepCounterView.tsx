import React from 'react';
import { Box, Typography, Divider, useTheme, alpha } from '@mui/material';
import PeachCard from '../components/PeachCard';
import { StepCounterData, resolveDistanceKm, calculateStepMetrics } from '@model/StepCounterData';
import { ExerciseProfile, isImperialLocale, CM_PER_INCH } from '@model/ExerciseProfile';

interface StepCounterViewProps {
    stepData: StepCounterData;
    profile: ExerciseProfile;
}

const KM_TO_MILES = 0.621371;

const hourlyTimeLabels = (count: number): string[] => {
    const now = new Date();
    return Array.from({ length: count }, (_, i) => {
        const d = new Date(now.getTime() - (count - 1 - i) * 60 * 60 * 1000);
        const hour = d.getHours();
        const displayHour = hour % 12 || 12;
        const amPm = hour >= 12 ? 'p' : 'a';
        return `${displayHour}${amPm}`;
    });
};

const dailyLabels = (count: number): string[] => {
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const now = new Date();
    return Array.from({ length: count }, (_, i) => {
        const d = new Date(now.getTime());
        d.setDate(now.getDate() - (count - 1 - i));
        return dayNames[d.getDay()];
    });
};

const SectionLabel: React.FC<{ text: string }> = ({ text }) => (
    <Typography
        variant="subtitle2"
        sx={{
            fontWeight: 700,
            color: '#8B5E3C',
            fontSize: '0.8125rem',
            letterSpacing: '0.02em',
            mb: 1,
        }}
    >
        {text}
    </Typography>
);

const StepsProgressRing: React.FC<{
    currentSteps: number;
    goal: number;
    distanceKm: number;
    calories: number;
    isImperial: boolean;
}> = ({ currentSteps, goal, distanceKm, calories, isImperial }) => {
    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;
    const trackColor = alpha(primaryColor, 0.12);
    const progress = Math.min(Math.max(currentSteps / Math.max(goal, 1), 0), 1);

    const strokeWidth = 10;
    const radius = 55;
    const circumference = Math.PI * radius; // Half arc
    const offset = circumference * (1 - progress);

    const displayDistance = isImperial ? distanceKm * KM_TO_MILES : distanceKm;
    const distanceUnit = isImperial ? 'mi' : 'km';

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 1 }}>
            <Box sx={{ position: 'relative', width: 160, height: 95 }}>
                <svg width="160" height="95" viewBox="0 0 160 95">
                    <path
                        d="M 15 85 A 55 55 0 0 1 145 85"
                        fill="none"
                        stroke={trackColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />
                    <path
                        d="M 15 85 A 55 55 0 0 1 145 85"
                        fill="none"
                        stroke={primaryColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>

                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 4,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
                        {currentSteps.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mt: 0.25 }}>
                        of {goal.toLocaleString()} steps
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {displayDistance.toFixed(1)} {distanceUnit}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {Math.round(calories)} kcal
                </Typography>
            </Box>
        </Box>
    );
};

const StepsBarChart: React.FC<{ values: number[]; labels: string[] }> = ({ values, labels }) => {
    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;
    const textColor = theme.palette.text.primary;
    const secondaryTextColor = theme.palette.text.secondary;

    const maxValue = Math.max(...values, 1);
    const barWidth = 14;
    const spacing = 4;
    const chartHeight = 55;

    return (
        <Box sx={{ height: 100, width: '100%', pt: 1 }}>
            <svg width="100%" height="100%" viewBox="0 0 200 90" preserveAspectRatio="xMidYMid meet">
                {values.map((steps, i) => {
                    const h = (steps / maxValue) * chartHeight;
                    const x = 10 + i * (barWidth + spacing);
                    const y = 70 - h;
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
                            <text
                                x={x + barWidth / 2}
                                y={Math.max(y - 4, 10)}
                                fontSize="7"
                                textAnchor="middle"
                                fill={textColor}
                                fontWeight="700"
                            >
                                {steps > 999 ? `${(steps / 1000).toFixed(1)}k` : steps}
                            </text>
                            <text
                                x={x + barWidth / 2}
                                y={82}
                                fontSize="7"
                                textAnchor="middle"
                                fill={secondaryTextColor}
                                fontWeight="500"
                            >
                                {labels[i] || ''}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </Box>
    );
};

const EmptyHistory: React.FC = () => (
    <Box sx={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
            No history
        </Typography>
    </Box>
);

export const StepCounterView: React.FC<StepCounterViewProps> = ({ stepData, profile }) => {
    const imperial = isImperialLocale();
    const currentSteps = stepData.currentDaySteps ?? 0;
    const { distanceKm, calories } = calculateStepMetrics(stepData, profile.weight);

    const hourlyValues = (stepData.hourlySteps || []).filter((s): s is number => s !== null).slice(-10);
    const hourlyLabels = hourlyTimeLabels(hourlyValues.length);

    const dailyHistory = (stepData.dailyHistory || []).filter((s): s is number => s !== null).slice(-6);
    const dailyValues = [...dailyHistory, currentSteps];
    const dailyLbls = dailyLabels(dailyValues.length);

    return (
        <PeachCard sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2D1A0E', mb: 2 }}>
                Steps
            </Typography>

            {/* TODAY Section */}
            <SectionLabel text="Today" />
            <StepsProgressRing
                currentSteps={currentSteps}
                goal={profile.stepGoal}
                distanceKm={distanceKm}
                calories={calories}
                isImperial={imperial}
            />

            <Divider sx={{ my: 2, borderColor: 'rgba(139, 94, 60, 0.15)' }} />

            {/* HOURLY Section */}
            <SectionLabel text="Hourly" />
            {hourlyValues.length === 0 || hourlyValues.every((v) => v === 0) ? (
                <EmptyHistory />
            ) : (
                <StepsBarChart values={hourlyValues} labels={hourlyLabels} />
            )}

            <Divider sx={{ my: 2, borderColor: 'rgba(139, 94, 60, 0.15)' }} />

            {/* DAILY Section */}
            <SectionLabel text="Daily" />
            {dailyValues.length === 0 ? (
                <EmptyHistory />
            ) : (
                <StepsBarChart values={dailyValues} labels={dailyLbls} />
            )}
        </PeachCard>
    );
};

export default StepCounterView;
