import React from 'react';
import Battery0Bar from '@mui/icons-material/Battery0Bar';
import Battery1Bar from '@mui/icons-material/Battery1Bar';
import Battery2Bar from '@mui/icons-material/Battery2Bar';
import Battery3Bar from '@mui/icons-material/Battery3Bar';
import Battery4Bar from '@mui/icons-material/Battery4Bar';
import Battery5Bar from '@mui/icons-material/Battery5Bar';
import Battery6Bar from '@mui/icons-material/Battery6Bar';
import Battery7Bar from '@mui/icons-material/Battery6Bar';
import Battery8Bar from '@mui/icons-material/Battery80';
import Battery9Bar from '@mui/icons-material/Battery90';
import BatteryFull from '@mui/icons-material/BatteryFull';
import LinearProgress from '@mui/material/LinearProgress';

interface BatteryLevelProps {
    level: number;
}

const BatteryLevel: React.FC<BatteryLevelProps> = ({ level }) => {

    const getIcon = (level: number) => {
        let icon = <Battery0Bar />

        switch (true) {
            case level === 0:
                icon = <Battery0Bar />
                break;

            case level <= 10:
                icon = <Battery1Bar />
                break;
            case level <= 20:
                icon = <Battery2Bar />
                break;
            case level <= 30:
                icon = <Battery3Bar />
                break;
            case level <= 40:
                icon = <Battery4Bar />
                break;
            case level <= 50:
                icon = <Battery5Bar />
                break;
            case level <= 60:
                icon = <Battery6Bar />
                break;
            case level <= 80:
                icon = <Battery8Bar />
                break;
            case level <= 90:
                icon = <Battery9Bar />
                break;
            case level <= 100:
                icon = <BatteryFull />
                break;

            default:
                break;
        }

        return icon
    }

    // Calculate the charge level based on the input percentage
    const chargeLevel = Math.min(100, Math.max(0, level));

    const icon = getIcon(level);

    return (
        <div className="flex items-center">

            {icon}

            {/* Battery Level Indicator */}
            <div style={{ width: '100px', marginRight: '8px' }}>
                <LinearProgress variant="determinate" value={chargeLevel} />
            </div>

            {/* Percentage Text */}
            <span>{chargeLevel}%</span>
        </div>
    );

};

export default BatteryLevel;