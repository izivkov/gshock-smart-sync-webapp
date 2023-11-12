"use client"

import AppCard from "@components/AppCard";
import AppText from "../components/AppText";
import TimerInput from "./TimerInput";
import SetTimerButton from "./SetTimerButton";
import { useEffect, useState } from "react";
import GShockAPI from "@/api/GShockAPI";
import { async } from "rxjs";

const TimerCard: React.FC = () => {

    const [timerValue, setTimerValue] = useState<{ hours: string, minutes: string, seconds: string }>({ hours: "", minutes: "", seconds: "" });

    useEffect(() => {
        (async () => {
            const value = await GShockAPI.getTimer();
            setTimerValue(value);
        })()
    }, []);

    const header = <div className="flex flex-row justify-between">
        <AppText text="Timer" variant='h5' />
    </div>

    const body = <div className="flex flex-row justify-between">
        <TimerInput hours={timerValue.hours} minutes={timerValue.minutes} seconds={timerValue.seconds} /><SetTimerButton label="Set Timer" />
    </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10" classNameHeader="h-10 pl-6 flex flex-row text-center items-center"
            classNameBody="bg-white w-96" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default TimerCard;