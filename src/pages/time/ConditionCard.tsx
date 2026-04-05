"use client"

import AppCard from "@components/AppCard";
import AppText from "../components/AppText";
import BatteryLevel from "./BatteryLevel";
import { useEffect, useState } from "react";
import GShockAPI from "@/api/GShockAPI";

const ConditionCard: React.FC = () => {

    const [batteryLevel, setBatteryLevel] = useState<string>("");
    const [temperature, setTemperature] = useState<string>("");

    useEffect(() => {
        (async () => {
            setTemperature((await GShockAPI.getWatchTemperature()).toString());
            setBatteryLevel((await GShockAPI.getBatteryLevel()).toString());
        })()
    }, []);

    const header = <div className="flex flex-row justify-between">
        <AppText text="Watch Condition" variant='h5' />
    </div>

    const body = <div>
        <div className="space-y-4">
            <div className="flex flex-row justify-center">
                <BatteryLevel level={Number(batteryLevel)} />
            </div>
            <div className="flex flex-row justify-center top-4">
                <AppText text={`${temperature}ºC`} variant='h4' />
            </div>
        </div>
    </div >

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer}
            classNameHeader="h-10 px-6 flex flex-row items-center border-b border-white/10"
            classNameBody="p-6" />
    );
}

export default ConditionCard;