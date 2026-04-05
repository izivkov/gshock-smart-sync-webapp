"use client"

import React, { useState, ChangeEvent, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

interface TimerValues {
    hours: number;
    minutes: number;
    seconds: number;
}

interface TimerInputParams {
    initialValue: TimerValues;
    onUpdate: (updatedValues: TimerValues) => void;
}

const TimerInput: React.FC<TimerInputParams> = ({ initialValue, onUpdate }) => {
    const [hours, setHours] = useState(initialValue.hours);
    const [minutes, setMinutes] = useState(initialValue.minutes);
    const [seconds, setSeconds] = useState(initialValue.seconds);

    useEffect(() => {
        setHours(initialValue.hours);
        setMinutes(initialValue.minutes);
        setSeconds(initialValue.seconds);
    }, [initialValue]);

    const handleHoursChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newHours = parseInt(e.target.value) || 0;
        if (newHours >= 0 && newHours <= 23) {
            setHours(newHours);
            onUpdate({ hours: newHours, minutes, seconds });
        }
    };

    const handleMinutesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newMinutes = parseInt(e.target.value) || 0;
        if (newMinutes >= 0 && newMinutes <= 59) {
            setMinutes(newMinutes);
            onUpdate({ hours, minutes: newMinutes, seconds });
        }
    };

    const handleSecondsChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newSeconds = parseInt(e.target.value) || 0;
        if (newSeconds >= 0 && newSeconds <= 59) {
            setSeconds(newSeconds);
            onUpdate({ hours, minutes, seconds: newSeconds });
        }
    };

    const inputStyle = {
        width: '48px',
        height: '40px',
        textAlign: 'center' as const,
        fontSize: '1.125rem',
        fontWeight: 500,
        fontFamily: 'inherit',
        border: '1px solid rgba(139, 94, 60, 0.3)',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        color: '#2D1A0E',
        outline: 'none',
        MozAppearance: 'textfield' as const,
        WebkitAppearance: 'none' as const,
    };

    const labelStyle = {
        fontSize: '0.625rem',
        fontWeight: 500,
        color: '#7A5C44',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        marginBottom: '4px',
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography sx={labelStyle}>Hr</Typography>
                <input
                    type="number"
                    min={0}
                    max={23}
                    value={hours.toString().padStart(2, '0')}
                    onChange={handleHoursChange}
                    style={inputStyle}
                />
            </Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 500, color: '#7A5C44', pb: '8px' }}>:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography sx={labelStyle}>Min</Typography>
                <input
                    type="number"
                    min={0}
                    max={59}
                    value={minutes.toString().padStart(2, '0')}
                    onChange={handleMinutesChange}
                    style={inputStyle}
                />
            </Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 500, color: '#7A5C44', pb: '8px' }}>:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography sx={labelStyle}>Sec</Typography>
                <input
                    type="number"
                    min={0}
                    max={59}
                    value={seconds.toString().padStart(2, '0')}
                    onChange={handleSecondsChange}
                    style={inputStyle}
                />
            </Box>
        </Box>
    );
};

export default TimerInput;
