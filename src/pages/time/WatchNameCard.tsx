"use client"

import React, { useState, useEffect } from 'react';
import AppCard from "@components/AppCard";
import AppText from "../components/AppText";
import { watchInfo } from "@api/WatchInfo";

const WatchNameCard: React.FC = () => {

    const header = <div className="flex flex-row justify-between">
        <AppText text="Watch Name" variant='h5' /></div>

    const body = <div>

        <div>
            <div className="flex flex-row justify-center">
                <AppText text={`${watchInfo.name}`} variant='lead' />
            </div>
        </div>
    </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer}
            classNameHeader="h-10 px-6 flex flex-row items-center border-b border-white/10"
            classNameBody="p-6" />
    );
}

export default WatchNameCard;