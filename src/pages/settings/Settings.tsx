"use client"

import React from 'react';
import withBottomMenu from '@components/withBottomMenu'

const Settings: React.FC = () => {
    return (
        <div>
            <div className="flex min-h-screen flex-col justify-between p-24">
                <h2>Settings Page</h2>
                <p>Welcome to the Settings Page</p>
            </div>
        </div>
    );
};

export default withBottomMenu(Settings);