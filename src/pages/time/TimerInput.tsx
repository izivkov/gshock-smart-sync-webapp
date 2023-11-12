"use client"

import React, { useState, ChangeEvent, useEffect } from 'react';

interface TimerInputParams {
    hours: string;
    minutes: string;
    seconds: string;
}

const TimerInput: React.FC<TimerInputParams> = ({ hours, minutes, seconds }) => {
    const [time, setTime] = useState({ hours: "00", minutes: "00", seconds: "00" });

    useEffect(() => {
        setTime({ hours: hours, minutes: minutes, seconds: seconds });
    }, [time]);

    const handleInputChangeMinuteSeconds = (e: ChangeEvent<HTMLInputElement>, field: keyof TimerInputParams) => {
        const value = e.target.value;

        if (!value) {
            setTime({ ...time, [field]: '' + value });
            return
        }

        // Input validation: Allow only two digits and numeric characters
        if (/^([0-5]?[0-9])$/.test(value)) {
            setTime({ ...time, [field]: value });
        }
    };

    const handleInputChangeHours = (e: ChangeEvent<HTMLInputElement>, field: keyof TimerInputParams) => {
        const value = e.target.value;

        if (!value) {
            setTime({ ...time, [field]: '' + value });
            return
        }

        // Input validation: Allow only two digits and numeric characters
        if (/^([0-2]?[0-23])$/.test(value)) {
            setTime({ ...time, [field]: value });
        }
    };

    return (
        <div className="flex space-x-2 items-center">
            <input
                type="text"
                placeholder="HH"
                value={time.hours}
                onChange={(e) => handleInputChangeHours(e, 'hours')}
                className="w-12 h-14 text-center text-2xl border border-gray-300 rounded-md"
            />
            <span className="text-2xl">:</span>
            <input
                type="text"
                placeholder="MM"
                value={time.minutes}
                onChange={(e) => handleInputChangeMinuteSeconds(e, 'minutes')}
                className="w-12 h-14 text-center text-2xl border border-gray-300 rounded-md p-1"
            />
            <span className="text-2xl">:</span>
            <input
                type="text"
                placeholder="SS"
                value={time.seconds}
                onChange={(e) => handleInputChangeMinuteSeconds(e, 'seconds')}
                className="w-12 h-14 text-center text-2xl border border-gray-300 rounded-md p-1"
            />
        </div>
    );
};

export default TimerInput;
