import React from 'react';
import { Box, Typography } from '@mui/material';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Battery80Icon from '@mui/icons-material/Battery80';
import Battery60Icon from '@mui/icons-material/Battery60';
import Battery30Icon from '@mui/icons-material/Battery30';
import Battery20Icon from '@mui/icons-material/Battery20';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';

interface BatteryLevelProps {
    level: number;
}

const BatteryLevel: React.FC<BatteryLevelProps> = ({ level }) => {
    const chargeLevel = Math.min(100, Math.max(0, level));

    const getBatteryConfig = (level: number) => {
        if (level >= 80) return { icon: BatteryFullIcon, color: '#4CAF50' };
        if (level >= 60) return { icon: Battery80Icon, color: '#8BC34A' };
        if (level >= 40) return { icon: Battery60Icon, color: '#FFC107' };
        if (level >= 20) return { icon: Battery30Icon, color: '#FF9800' };
        if (level >= 10) return { icon: Battery20Icon, color: '#FF5722' };
        return { icon: BatteryAlertIcon, color: '#F44336' };
    };

    const config = getBatteryConfig(chargeLevel);
    const IconComponent = config.icon;

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: '100px',
                backgroundColor: `${config.color}12`,
            }}
        >
            <IconComponent 
                sx={{ 
                    fontSize: 20, 
                    color: config.color,
                    transform: 'rotate(90deg)',
                }} 
            />
            <Typography 
                sx={{ 
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: config.color,
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {chargeLevel}%
            </Typography>
        </Box>
    );
};

export default BatteryLevel;
