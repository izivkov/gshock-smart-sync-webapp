import React from 'react';
import Event from '@/model/Event';

import { getFrequencyFormatted } from './ReminderUtils';
import { dayOfWeekType, repeatPeriodType } from './ReminderData';
import { Typography } from '@mui/material';

interface FrequencyProps {
    event: Event
}

const Frequency: React.FC<FrequencyProps> = ({ event }) => {

    const text = getFrequencyFormatted(event.repeatPeriod as repeatPeriodType, event.startDate, event.daysOfWeek as dayOfWeekType[]);

    return (
        <Typography variant="subtitle1" color="text.secondary">
            {text}
        </Typography>
    );
};

export default Frequency;
