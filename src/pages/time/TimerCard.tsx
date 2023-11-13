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
        <AppCard header={header} body={body} footer={footer} className="mt-10" classNameHeader="h-10 pl-6 flex flex-row text-center items-center"
            classNameBody="bg-white w-96" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default TimerCard;