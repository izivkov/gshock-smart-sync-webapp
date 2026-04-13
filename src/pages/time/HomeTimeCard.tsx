"use client"

import GShockAPI from "@/api/GShockAPI";
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import { useEffect, useState } from "react";
import { progressEvents, EventAction } from '@api/ProgressEvents';

const HomeTimeCard: React.FC = () => {

    const [homeTime, setHomeTime] = useState<string>("");

    useEffect(() => {
        const refresh = async () => {
            setHomeTime(await GShockAPI.getHomeTime());
        };

        // Initial load
        refresh();

        // Listen for updates from other components
        progressEvents.runEventActions('HomeTimeCard', [
            new EventAction('HomeTimeUpdated', refresh)
        ]);
    }, []);


    const header = <div className="flex flex-row justify-between">
        <AppText text="Home Time" variant='h5' /></div>

    const body = <div>

        <div>
            <div className="flex flex-row justify-center">
                <AppText text={`${homeTime}`} variant='h6' />
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

export default HomeTimeCard;