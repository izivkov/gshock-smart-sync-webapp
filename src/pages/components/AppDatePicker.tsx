import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface TimePickerProps {
    onTimeSelected: (time: any) => void;
    initialDate: Dayjs
}

const AppDatePicker: React.FC<TimePickerProps> = ({ onTimeSelected, initialDate }) => {
    const [selectedTime, setSelectedTime] = useState(null);

    const handleTimeAccepted = (time: any) => {
        setSelectedTime(time);

        if (onTimeSelected) {
            onTimeSelected(time);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} >
            <DatePicker defaultValue={dayjs('2023-01-01T00:00:00')}
                value={initialDate}
                onAccept={handleTimeAccepted}
            />
        </LocalizationProvider>
    );
}

export default AppDatePicker