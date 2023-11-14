"use client"

import React, { Component } from 'react';
import AppButton from '@components/AppButton';
import { progressEvents } from '@api/ProgressEvents';
import GShockAPI from '@/api/GShockAPI';

interface SetTimeButtonProps {
    label: string;
}

const SetTimeButtonProps: React.FC<SetTimeButtonProps> = ({ label }) => {

    const setTime: () => void = () => {
        GShockAPI.setTime()
        progressEvents.onNext("HomeTimeUpdated")
    }

    return (
        <AppButton label={label} onClick={setTime} />
    )
}

export default SetTimeButtonProps;