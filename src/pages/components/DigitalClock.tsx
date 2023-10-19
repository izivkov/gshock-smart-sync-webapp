"use client"

import React, { useState, useEffect } from 'react';

const DigitalClock: React.FC = () => {
    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        // Function to update the current time
        const updateCurrentTime = () => {
            const locale = navigator.language; // Get the user's locale

            const options = {
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
            };

            const formattedTime = new Intl.DateTimeFormat(locale, options as any).format(
                new Date()
            );

            setCurrentTime(formattedTime);
        };

        // Update the time initially and then every second
        updateCurrentTime();
        const intervalId = setInterval(updateCurrentTime, 1000);

        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="text-4xl font-semibold text-center" suppressHydrationWarning>
            {currentTime}
        </div>
    );
};

export default DigitalClock;
