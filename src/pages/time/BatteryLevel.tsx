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
        // We use darker shades for text/icon to ensure high contrast against the peach background
        if (level >= 80) return { icon: BatteryFullIcon, color: '#1B5E20', bgColor: '#E8F5E9' }; // Dark Green
        if (level >= 60) return { icon: Battery80Icon, color: '#33691E', bgColor: '#F1F8E9' }; // Dark Light Green
        if (level >= 40) return { icon: Battery60Icon, color: '#E65100', bgColor: '#FFF8E1' }; // Dark Orange/Amber
        if (level >= 20) return { icon: Battery30Icon, color: '#BF360C', bgColor: '#FFF3E0' }; // Dark Deep Orange
        if (level >= 10) return { icon: Battery20Icon, color: '#D84315', bgColor: '#FBE9E7' }; // Dark Red-Orange
        return { icon: BatteryAlertIcon, color: '#B71C1C', bgColor: '#FFEBEE' }; // Dark Red
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
                backgroundColor: config.bgColor,
                border: `1px solid ${config.color}25`, // Very subtle border using foreground color
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
        >
            <IconComponent 
                sx={{ 
                    fontSize: 18,
                    color: config.color,
                    transform: 'rotate(90deg)',
                }}
            />
            <Typography 
                sx={{ 
                    fontSize: '0.8125rem',
                    fontWeight: 900,
                    color: config.color,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '0.02em'
                }}
            >
                {chargeLevel}%
            </Typography>
        </Box>
    );
};

export default BatteryLevel;
