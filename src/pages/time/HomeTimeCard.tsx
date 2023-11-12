"use client"

import GShockAPI from "@/api/GShockAPI";
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import { useEffect, useState } from "react";

const HomeTimeCard: React.FC = () => {

    const [homeTime, setHomeTime] = useState<string>("");

    useEffect(() => {
        (async () => {
            setHomeTime(await GShockAPI.getHomeTime());
        })()
    }, []);

    const header = <div className="flex flex-row justify-between">
        <AppText text="Home Time" variant='h5' /></div>

    const body = <div>

        <div>
            <div className="flex flex-row justify-center">
                <AppText text={`${homeTime}`} variant='lead' />
            </div>
        </div>
    </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10"
            classNameHeader="h-10 pl-6 flex flex-row text-center items-center"
            classNameBody="bg-white w-96" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default HomeTimeCard;