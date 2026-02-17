"use client"

import AppCard from "@components/AppCard";
import AppText from "../components/AppText";
import TimerInput from "./TimerInput";
import SetTimerButton from "./SetTimerButton";
import { useEffect, useState } from "react";
import GShockAPI from "@/api/GShockAPI";

const TimerCard: React.FC = () => {

    const [timerValue, setTimerValue] = useState<{ hours: number, minutes: number, seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        (async () => {
            const value = await GShockAPI.getTimer();
            setTimerValue(value);
        })()
    }, []);

    const handleInputChange = (value: { hours: number, minutes: number, seconds: number }) => {
        console.log(value);
        setTimerValue(value);
    }

    const header = <div className="flex flex-row justify-between">
        <AppText text="Timer" variant='h5' />
    </div>

    const body = <div className="flex flex-row justify-between">
        <TimerInput initialValue={timerValue} onUpdate={handleInputChange} />
        <SetTimerButton timerValue={timerValue} label="Set Timer" />
    </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer}
            classNameHeader="h-10 px-6 flex flex-row items-center border-b border-white/10"
            classNameBody="p-6" />
    );
}

export default TimerCard;