import React from 'react';
import { Dayjs } from 'dayjs';
import Event from '@/model/Event';

interface DateDisplayProps {
    event: Event
}

const Period: React.FC<DateDisplayProps> = ({ event }) => {

    const formattedDate = event.getPeriodFormatted();

    return (
        <div className="text-lg text-gray-700">
            {formattedDate}
        </div>
    );
};

export default Period;
