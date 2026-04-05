"use client"

import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface TimerValues {
    hours: number;
    minutes: number;
    seconds: number;
}

interface TimerInputParams {
    initialValue: TimerValues;
    onUpdate: (updatedValues: TimerValues) => void;
}

interface TimeUnitInputProps {
    value: number;
    max: number;
    label: string;
    onChange: (value: number) => void;
}

const TimeUnitInput: React.FC<TimeUnitInputProps> = ({ value, max, label, onChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const increment = () => {
        const newValue = value >= max ? 0 : value + 1;
        onChange(newValue);
    };

    const decrement = () => {
        const newValue = value <= 0 ? max : value - 1;
        onChange(newValue);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value) || 0;
        if (newValue >= 0 && newValue <= max) {
            onChange(newValue);
        }
    };

    const handleFocus = () => {
        inputRef.current?.select();
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 0.5,
            }}
        >
            <IconButton 
                onClick={increment}
                size="small"
                sx={{ 
                    p: 0.25,
                    color: '#8B5E3C',
                    '&:hover': { backgroundColor: 'rgba(139, 94, 60, 0.08)' },
                }}
            >
                <KeyboardArrowUpIcon sx={{ fontSize: 20 }} />
            </IconButton>
            
            <Box
                sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={value.toString().padStart(2, '0')}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    style={{
                        width: '52px',
                        height: '48px',
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        fontFamily: '"SF Mono", "Roboto Mono", monospace',
                        border: 'none',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(139, 94, 60, 0.08)',
                        color: '#2D1A0E',
                        outline: 'none',
                        caretColor: '#8B5E3C',
                    }}
                />
                <Typography 
                    sx={{ 
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        color: '#7A5C44',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        mt: 0.5,
                    }}
                >
                    {label}
                </Typography>
            </Box>

            <IconButton 
                onClick={decrement}
                size="small"
                sx={{ 
                    p: 0.25,
                    color: '#8B5E3C',
                    '&:hover': { backgroundColor: 'rgba(139, 94, 60, 0.08)' },
                }}
            >
                <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
            </IconButton>
        </Box>
    );
};

const TimerInput: React.FC<TimerInputParams> = ({ initialValue, onUpdate }) => {
    const [hours, setHours] = useState(initialValue.hours);
    const [minutes, setMinutes] = useState(initialValue.minutes);
    const [seconds, setSeconds] = useState(initialValue.seconds);

    useEffect(() => {
        setHours(initialValue.hours);
        setMinutes(initialValue.minutes);
        setSeconds(initialValue.seconds);
    }, [initialValue]);

    const handleHoursChange = (value: number) => {
        setHours(value);
        onUpdate({ hours: value, minutes, seconds });
    };

    const handleMinutesChange = (value: number) => {
        setMinutes(value);
        onUpdate({ hours, minutes: value, seconds });
    };

    const handleSecondsChange = (value: number) => {
        setSeconds(value);
        onUpdate({ hours, minutes, seconds: value });
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
            }}
        >
            <TimeUnitInput 
                value={hours} 
                max={23} 
                label="hrs" 
                onChange={handleHoursChange} 
            />
            
            <Typography 
                sx={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 300, 
                    color: '#8B5E3C',
                    opacity: 0.6,
                    mt: -3,
                }}
            >
                :
            </Typography>
            
            <TimeUnitInput 
                value={minutes} 
                max={59} 
                label="min" 
                onChange={handleMinutesChange} 
            />
            
            <Typography 
                sx={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 300, 
                    color: '#8B5E3C',
                    opacity: 0.6,
                    mt: -3,
                }}
            >
                :
            </Typography>
            
            <TimeUnitInput 
                value={seconds} 
                max={59} 
                label="sec" 
                onChange={handleSecondsChange} 
            />
        </Box>
    );
};

export default TimerInput;
