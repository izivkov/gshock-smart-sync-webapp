"use client"

import dayjs, { Dayjs } from 'dayjs';
import React, { useState, useEffect } from 'react';

interface AlarmTimeProps {
    alarmTime: Dayjs
}

const AlarmTime: React.FC<AlarmTimeProps> = ({ alarmTime }) => {

    const [time, setTime] = useState(alarmTime);

    useEffect(() => {
        setTime(alarmTime);
    }, [alarmTime]);

    return (
        <div className="text-4xl font-semibold text-center" suppressHydrationWarning>
            {time.format('h:mm A')}
        </div>
    );
};

export default AlarmTime;
