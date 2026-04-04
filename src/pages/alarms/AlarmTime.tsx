"use client"

import dayjs, { Dayjs } from 'dayjs';
import React, { useState, useEffect } from 'react';

interface AlarmTimeProps {
    alarmTime: Dayjs
}

const AlarmTime: React.FC<AlarmTimeProps> = ({ alarmTime }) => {
    const [timeStr, setTimeStr] = useState<string | null>(null);

    useEffect(() => {
        requestAnimationFrame(() => setTimeStr(alarmTime ? alarmTime.format('h:mm A') : ""));
    }, [alarmTime]);

    return (
        <div className="text-4xl font-semibold text-center">
            {timeStr || '\u00A0'}
        </div>
    );
};

export default AlarmTime;
