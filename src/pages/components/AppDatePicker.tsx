import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface DatePickerProps {
    onTimeSelected: (time: any) => void;
    initialDate: Dayjs
    label: string
    open: boolean
}

const AppDatePicker: React.FC<DatePickerProps> = ({ onTimeSelected, initialDate, label, open }) => {
    const [selectedDate, setSelectedDate] = useState('');

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
        onTimeSelected(event.target.value);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex flex-row justify-between items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <input onChange={handleDateChange} className="border-2 rounded-lg border-gray-300 focus:border-indigo-300" id="dateID" type="date" autoComplete="off" placeholder="MM/DD/YYYY" />
            </div>

        </LocalizationProvider>
    );
}

export default AppDatePicker