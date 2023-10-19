"use client"

import { ReactNode } from "react";

import AppCard from "@components/AppCard";
import AppText from "../components/AppText";
import TimerInput from "./TimerInput";
import SetTimerButton from "./SetTimerButton";

const TimerCard: React.FC = () => {

    const header = <div className="flex flex-row justify-between">
        <AppText text="Timer" variant='h5' />
    </div>

    const body = <div className="flex flex-row justify-between">
        <TimerInput /><SetTimerButton label="Set Timer" />
    </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10" classNameHeader="h-10 pl-6 flex flex-row text-center items-center"
            classNameBody="bg-white w-96" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default TimerCard;