"use client"

import React, { useEffect, useState } from 'react';
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import AppSwitch from '../components/AppSwitch';

interface AutoTimeAdjustCardProps {
}

const AutoTimeAdjustCard: React.FC<AutoTimeAdjustCardProps> = ({ }) => {

    const header = <div className="flex flex-row w-full justify-between items-center pl-4 pr-4">
        <AppText text="Auto Time Adjustment" variant='h5' />
    </div>

    const body =
        <div className="flex flex-row w-full justify-between items-center">
            <AppText text="Time Adjustment" variant='paragraph' />
            <AppSwitch checked={true} onChange={() => { }} />
        </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10" classNameHeader="w-96 h-10 flex flex-row text-center items-center"
            classNameBody="bg-white" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default AutoTimeAdjustCard;