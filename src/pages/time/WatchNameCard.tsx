"use client"

import React, { useState, useEffect } from 'react';
import AppCard from "@components/AppCard";
import AppText from "../components/AppText";
import { watchInfo } from "@api/WatchInfo";

const WatchNameCard: React.FC = () => {

    const body =
        <div className="flex flex-row w-full justify-between items-center py-1.5 px-4 bg-white rounded-xl">
            <AppText text="Watch Name" variant='h6' />
            <AppText text={`${watchInfo.name}`} variant='paragraph' className="font-semibold" />
        </div>

    return (
        <AppCard header={null} body={body} footer={null} />
    );
}

export default WatchNameCard;