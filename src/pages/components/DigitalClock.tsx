"use client"

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

interface DigitalClockProps {
    size?: 'small' | 'medium' | 'large';
    showSeconds?: boolean;
}

const DigitalClock: React.FC<DigitalClockProps> = ({ size = 'large', showSeconds = true }) => {
    const [hours, setHours] = useState<string>('--');
    const [minutes, setMinutes] = useState<string>('--');
    const [seconds, setSeconds] = useState<string>('--');
    const [period, setPeriod] = useState<string>('');

    useEffect(() => {
        const updateCurrentTime = () => {
            const now = new Date();
            const locale = navigator.language;
            const is12Hour = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).format(now).includes('AM') || 
                            new Intl.DateTimeFormat(locale, { hour: 'numeric' }).format(now).includes('PM');
            
            let h = now.getHours();
            const m = now.getMinutes();
            const s = now.getSeconds();
            
            if (is12Hour) {
                setPeriod(h >= 12 ? 'PM' : 'AM');
                h = h % 12 || 12;
            }
            
            setHours(h.toString().padStart(2, '0'));
            setMinutes(m.toString().padStart(2, '0'));
            setSeconds(s.toString().padStart(2, '0'));
        };

        updateCurrentTime();
        const intervalId = setInterval(updateCurrentTime, 1000);
        return () => clearInterval(intervalId);
    }, []);

    const sizeConfig = {
        small: { time: '1.5rem', colon: '1.25rem', period: '0.625rem', gap: 0.25 },
        medium: { time: '2rem', colon: '1.75rem', period: '0.75rem', gap: 0.5 },
        large: { time: '3rem', colon: '2.5rem', period: '0.875rem', gap: 0.75 },
    };

    const config = sizeConfig[size];

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                alignItems: 'baseline', 
                gap: config.gap,
                fontFamily: '"SF Mono", "Roboto Mono", monospace',
            }}
            suppressHydrationWarning
        >
            <Typography
                component="span"
                sx={{
                    fontSize: config.time,
                    fontWeight: 600,
                    color: '#2D1A0E',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                }}
            >
                {hours}
            </Typography>
            <Typography
                component="span"
                sx={{
                    fontSize: config.colon,
                    fontWeight: 400,
                    color: '#8B5E3C',
                    opacity: 0.7,
                    animation: 'blink 1s ease-in-out infinite',
                    '@keyframes blink': {
                        '0%, 100%': { opacity: 0.7 },
                        '50%': { opacity: 0.3 },
                    },
                }}
            >
                :
            </Typography>
            <Typography
                component="span"
                sx={{
                    fontSize: config.time,
                    fontWeight: 600,
                    color: '#2D1A0E',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                }}
            >
                {minutes}
            </Typography>
            {showSeconds && (
                <>
                    <Typography
                        component="span"
                        sx={{
                            fontSize: config.colon,
                            fontWeight: 400,
                            color: '#8B5E3C',
                            opacity: 0.5,
                        }}
                    >
                        :
                    </Typography>
                    <Typography
                        component="span"
                        sx={{
                            fontSize: config.time,
                            fontWeight: 500,
                            color: '#7A5C44',
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {seconds}
                    </Typography>
                </>
            )}
            {period && (
                <Typography
                    component="span"
                    sx={{
                        fontSize: config.period,
                        fontWeight: 600,
                        color: '#8B5E3C',
                        ml: 0.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}
                >
                    {period}
                </Typography>
            )}
        </Box>
    );
};

export default DigitalClock;
