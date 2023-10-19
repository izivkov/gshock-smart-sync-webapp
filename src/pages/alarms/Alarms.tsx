"use client"

import React from 'react';
import withBottomMenu from '@components/withBottomMenu'

const Alarms: React.FC = () => {
    return (
        <div>
            <div className="flex min-h-screen flex-col justify-between p-24">
                <h2>Alarms Page</h2>
                <p>Welcome to the Alarms Page</p>
            </div>
        </div>
    );
};

export default withBottomMenu(Alarms);