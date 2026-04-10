import React from 'react';
import Event from '@/model/Event';

import { getFrequencyFormatted } from './ReminderUtils';
import { dayOfWeekType, repeatPeriodType } from './ReminderData';

interface FrequencyProps {
    event: Event
}

const Frequency: React.FC<FrequencyProps> = ({ event }) => {

    const text = getFrequencyFormatted(event.repeatPeriod as repeatPeriodType, event.startDate, event.daysOfWeek as dayOfWeekType[]);

    return (
        <div className="text-lg text-gray-700">
            {text}
        </div>
    );
};

export default Frequency;
