import React, { useEffect, useState } from 'react';
import { Dayjs } from 'dayjs';
import Event from '@/model/Event';
import { getPeriodFormatted } from './ReminderUtils';
import { start } from 'repl';

interface DateDisplayProps {
    startDate: { year: number; month: string; day: number }
    endDate: { year: number; month: string; day: number }
}

const Period: React.FC<DateDisplayProps> = ({ startDate, endDate }) => {

    const [formattedDate, setFormattedDate] = useState(getPeriodFormatted(startDate, endDate));

    useEffect(() => {
        setFormattedDate(getPeriodFormatted(startDate, endDate));
    }, [startDate, endDate]);

    return (
        <div className="text-lg text-gray-700">
            {formattedDate}
        </div>
    );
};

export default Period;
