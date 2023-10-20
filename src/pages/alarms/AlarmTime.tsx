"use client"

import React, { useState, useEffect } from 'react';

const AlarmTime: React.FC = () => {

    const alarmTime = "12:35 pm"

    return (
        <div className="text-4xl font-semibold text-center" suppressHydrationWarning>
            {alarmTime}
        </div>
    );
};

export default AlarmTime;
