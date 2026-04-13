"use client"

import dayjs, { Dayjs } from 'dayjs';
import React, { useState, useEffect, useMemo } from 'react';
import { isNorthAmerica12HourClock } from '@/utils/localeDisplay';

interface AlarmTimeProps {
    alarmTime: Dayjs
}

const AlarmTime: React.FC<AlarmTimeProps> = ({ alarmTime }) => {

    const [time, setTime] = useState(alarmTime);
    const use12Hour = useMemo(() => isNorthAmerica12HourClock(), []);

    useEffect(() => {
        setTime(alarmTime);
    }, [alarmTime]);

    return (
        <div className="text-xl font-semibold text-center" suppressHydrationWarning>
            {use12Hour ? time.format('h:mm A') : time.format('HH:mm')}
        </div>
    );
};

export default AlarmTime;
