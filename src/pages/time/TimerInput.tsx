"use client"

import React, { useState, ChangeEvent, useEffect } from 'react';

interface TimerValues {
    hours: number;
    minutes: number;
    seconds: number;
}

interface TimerInputParams {
    initialValue: TimerValues;
    onUpdate: (updatedValues: TimerValues) => void;
}

const TimerInput: React.FC<TimerInputParams> = ({ initialValue, onUpdate }) => {
    const [hours, setHours] = useState(initialValue.hours);
    const [minutes, setMinutes] = useState(initialValue.minutes);
    const [seconds, setSeconds] = useState(initialValue.seconds);

    useEffect(() => {
        setHours(initialValue.hours);
        setMinutes(initialValue.minutes);
        setSeconds(initialValue.seconds);
    }, [initialValue]);

    const handleHoursChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newHours = parseInt(e.target.value) || 0;
        if (newHours >= 0 && newHours <= 23) {
            setHours(newHours);
            onUpdate({ hours: newHours, minutes, seconds });
        }
    };

    const handleMinutesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newMinutes = parseInt(e.target.value) || 0;
        if (newMinutes >= 0 && newMinutes <= 59) {
            setMinutes(newMinutes);
            onUpdate({ hours, minutes: newMinutes, seconds });
        }
    };

    const handleSecondsChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newSeconds = parseInt(e.target.value) || 0;
        if (newSeconds >= 0 && newSeconds <= 59) {
            setSeconds(newSeconds);
            onUpdate({ hours, minutes, seconds: newSeconds });
        }
    };

    return (
        <div className="flex space-x-2 items-center">
            <input
                type="number"
                placeholder="HH"
                value={hours}
                onChange={(e) => handleHoursChange(e)}
                className="w-16 h-14 text-center text-2xl border border-gray-300 rounded-md"
            />
            <span className="text-2xl">:</span>
            <input
                type="number"
                placeholder="MM"
                value={minutes}
                onChange={(e) => handleMinutesChange(e)}
                className="w-16 h-14 text-center text-2xl border border-gray-300 rounded-md p-1"
            />
            <span className="text-2xl">:</span>
            <input
                type="number"
                placeholder="SS"
                value={seconds}
                onChange={(e) => handleSecondsChange(e)}
                className="w-16 h-14 text-center text-2xl border border-gray-300 rounded-md p-1"
            />
        </div>
    );
};

export default TimerInput;
