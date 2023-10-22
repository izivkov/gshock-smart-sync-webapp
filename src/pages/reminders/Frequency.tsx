import React from 'react';
import Event from '@/model/Event';

interface FrequencyProps {
    event: Event
}

const Frequency: React.FC<FrequencyProps> = ({ event }) => {

    const text = event.getFrequencyFormatted();

    return (
        <div className="text-lg text-gray-700">
            {text}
        </div>
    );
};

export default Frequency;
