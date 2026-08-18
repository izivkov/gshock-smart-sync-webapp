import React, { useState } from 'react';
import { Box, Typography, MenuItem, Select, useTheme } from '@mui/material';
import PeachCard from '../components/PeachCard';
import { StepCounterData } from '@/api/StepCounterData';

export enum StepDataOption {
    TODAY = "Today",
    HOURLY = "Hourly",
    DAILY = "Daily"
}

interface StepCounterViewProps {
    stepData: StepCounterData;
}

const StepCounterView: React.FC<StepCounterViewProps> = ({ stepData }) => {
    const [selectedOption, setSelectedOption] = useState<StepDataOption>(StepDataOption.TODAY);
    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;
    const surfaceVariantColor = 'rgba(139, 94, 60, 0.12)';
    const textColor = theme.palette.text.primary;

    const renderToday = () => {
        const currentSteps = stepData.currentDaySteps ?? 0;
        const goal = 10000;
        const progress = Math.min(currentSteps / goal, 1);

        const strokeWidth = 12;
        const radius = 60;
        const circumference = Math.PI * radius;
        const offset = circumference * (1 - progress);

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
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
                        alignItems: 'center'
                    }}>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: textColor, lineHeight: 1 }}>
                            {currentSteps.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            of {goal.toLocaleString()} Goal
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    };

    const renderHourly = () => {
        const rawHourly = stepData.hourlySteps.filter((s): s is number => s !== null);
        const hourly = rawHourly.slice(-6); // Take the last 6 intervals

        if (hourly.length === 0 || hourly.every(s => s === 0)) {
            return (
                <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No history</Typography>
                </Box>
            );
        }

        const maxSteps = Math.max(...hourly, 1);
        const barWidth = 20;
        const spacing = 10;
        const chartHeight = 50;

        const now = new Date();
        const labels = hourly.map((_, i) => {
            const d = new Date(now.getTime() - (hourly.length - 1 - i) * 60 * 60000); // 1 hour intervals
            const hour = d.getHours();
            const displayHour = hour % 12 || 12;
            const amPm = hour >= 12 ? 'p' : 'a';
            return `${displayHour}${amPm}`;
        });

        return (
            <Box sx={{ height: 110, width: '100%', pt: 1 }}>
                <svg width="100%" height="100" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
                    {hourly.map((steps, i) => {
                        const h = (steps / maxSteps) * chartHeight;
                        const x = 15 + i * (barWidth + 12);
                        const y = 70 - h;
                        return (
                            <g key={i}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={Math.max(h, 4)}
                                    rx={4}
                                    fill={primaryColor}
                                />
                                <text x={x + barWidth/2} y={y - 6} fontSize="9" textAnchor="middle" fill={textColor} fontWeight="700">
                                    {steps > 999 ? (steps/1000).toFixed(1) + 'k' : steps}
                                </text>
                                <text x={x + barWidth/2} y={88} fontSize="9" textAnchor="middle" fill="text.secondary" fontWeight="500">
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
        const dailyHistory = stepData.dailyHistory.filter((s): s is number => s !== null);
        const todaySteps = stepData.currentDaySteps ?? 0;
        const daily = [...dailyHistory.slice(-6), todaySteps];

        const maxSteps = Math.max(...daily, 1);
        const barWidth = 20;
        const spacing = 8;
        const chartHeight = 50;

        const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        const now = new Date();
        const labels = daily.map((_, i) => {
            const d = new Date(now.getTime());
            d.setDate(now.getDate() - (daily.length - 1 - i));
            return dayLabels[d.getDay()];
        });

        return (
            <Box sx={{ height: 110, width: '100%', pt: 1 }}>
                <svg width="100%" height="100" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
                    {daily.map((steps, i) => {
                        const h = (steps / maxSteps) * chartHeight;
                        const x = 10 + i * (barWidth + spacing);
                        const y = 70 - h;
                        return (
                            <g key={i}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={Math.max(h, 4)}
                                    rx={4}
                                    fill={primaryColor}
                                />
                                <text x={x + barWidth/2} y={y - 6} fontSize="9" textAnchor="middle" fill={textColor} fontWeight="700">
                                    {steps > 999 ? (steps/1000).toFixed(1) + 'k' : steps}
                                </text>
                                <text x={x + barWidth/2} y={88} fontSize="9" textAnchor="middle" fill="text.secondary" fontWeight="500">
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
                <Typography sx={{ fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Activity
                </Typography>
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
                        '& .MuiSelect-select': { py: 0, pr: '20px !important' }
                    }}
                >
                    {Object.values(StepDataOption).map(option => (
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
        </PeachCard>
    );
};

export default StepCounterView;
