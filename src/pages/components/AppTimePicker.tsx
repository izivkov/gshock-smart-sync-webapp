import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface AppTimePickerProps {
    onTimeSelected: (time: any) => void;
    initialTime: Dayjs
}

const AppTimePicker: React.FC<AppTimePickerProps> = ({ onTimeSelected, initialTime }) => {
    const [selectedTime, setSelectedTime] = useState(null);

    const handleTimeAccepted = (time: any) => {
        setSelectedTime(time);

        if (onTimeSelected) {
            onTimeSelected(time);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} >
            <StaticTimePicker defaultValue={dayjs('2023-01-01T00:00:00')}
                value={initialTime}
                onAccept={handleTimeAccepted}
            />
        </LocalizationProvider>
    );
}

export default AppTimePicker