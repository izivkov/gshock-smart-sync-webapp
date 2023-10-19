"use client"

import React, { Component } from 'react';
import AppButton from '../components/AppButton';

interface SetTimeButtonProps {
    label: string;
}

const SetTimeButtonProps: React.FC<SetTimeButtonProps> = ({ label }) => {

    const setTime: () => void = () => {
        alert("Set Time Clicked")
    }

    return (
        <AppButton label={label} onClick={setTime} />
    )
}

export default SetTimeButtonProps;