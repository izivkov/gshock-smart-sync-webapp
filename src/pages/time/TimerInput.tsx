"use client"

import React, { useState, ChangeEvent } from 'react';
import { Input } from '@material-tailwind/react';

interface Time {
    hours: string;
    minutes: string;
    seconds: string;
}

const TimerInput: React.FC = () => {
    const [time, setTime] = useState<Time>({ hours: '', minutes: '', seconds: '' });

    const handleInputChangeMinuteSeconds = (e: ChangeEvent<HTMLInputElement>, field: keyof Time) => {
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

    const handleInputChangeHours = (e: ChangeEvent<HTMLInputElement>, field: keyof Time) => {
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
