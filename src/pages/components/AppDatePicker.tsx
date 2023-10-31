import React, { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import AppText from './AppText';

interface DatePickerProps {
    onDateSelected: (time: Dayjs) => void;
    initialDate: Dayjs
    label: string
    open: boolean
    disabled?: boolean
}

const AppDatePicker: React.FC<DatePickerProps> = ({ onDateSelected, initialDate, label, open, disabled }) => {
    const [selectedDate, setSelectedDate] = useState(initialDate.year() + '-' + initialDate.format("MM") + '-' + initialDate.format("DD"));

    useEffect(() => {
        const date = initialDate.year() + '-' + initialDate.format("MM") + '-' + initialDate.format("DD");
        setSelectedDate(date);
    }, [initialDate]);

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const date = event.target.value;
        setSelectedDate(date);
        onDateSelected(dayjs(date, { format: 'YYYY-MM-DD' }));
    };

    return (
        <div className="flex flex-row justify-between items-center gap-2">
            <label className="text-md font-bold font-large text-gray-700">{label}</label>
            <input disabled={disabled} onChange={handleDateChange}
                className="p-2 border border-gray-100 rounded-md w-full focus:ring focus:ring-blue-100"
                id="dateID" type="date" autoComplete="off" placeholder="MM/DD/YYYY" value={selectedDate} />
        </div>
    );
}

export default AppDatePicker