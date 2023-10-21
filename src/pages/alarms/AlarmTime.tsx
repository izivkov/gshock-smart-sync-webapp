"use client"

import { Dayjs } from 'dayjs';
import React, { useState, useEffect } from 'react';

interface AlarmTimeProps {
    alarmTime: Dayjs
}

const AlarmTime: React.FC<AlarmTimeProps> = ({ alarmTime }) => {

    return (
        <div className="text-4xl font-semibold text-center" suppressHydrationWarning>
            {alarmTime.format('h:mm A')}
        </div>
    );
};

export default AlarmTime;
