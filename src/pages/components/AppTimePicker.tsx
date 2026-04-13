import React, { useEffect, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { isNorthAmerica12HourClock } from '@/utils/localeDisplay';

interface AppTimePickerProps {
    onTimeSelected: (time: any) => void;
    onCancel: () => void;
    initialTime: Dayjs
}

const AppTimePicker: React.FC<AppTimePickerProps> = ({ onTimeSelected, onCancel, initialTime }) => {
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(initialTime);
    const ampm = useMemo(() => isNorthAmerica12HourClock(), []);

    useEffect(() => {
        setSelectedTime(initialTime);
    }, [initialTime]);

    const handleTimeAccepted = (time: any) => {
        setSelectedTime(time);

        if (onTimeSelected) {
            onTimeSelected(time);
        }
    };

    const handleChange = (time: any) => {
        setSelectedTime(time);
    };

    const onClose = () => {
        onCancel();
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} >
            <StaticTimePicker
                ampm={ampm}
                value={selectedTime}
                onClose={onClose}
                onAccept={handleTimeAccepted}
                onChange={handleChange}
            />
        </LocalizationProvider>
    );
}

export default AppTimePicker