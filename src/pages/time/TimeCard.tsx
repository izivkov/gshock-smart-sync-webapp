"use client"

import AppCard from "@components/AppCard";
import SetTimeButton from "./SetTimeButton";
import AppText from "../components/AppText";
import DigitalClock from "../components/DigitalClock";

const TimeCard: React.FC = () => {

    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

    const header = <div className="flex flex-row justify-between">
        <AppText text="Set Time" variant='h5' /></div>

    const body = <div>
        <div className="flex flex-row justify-between">
            <DigitalClock />
            <SetTimeButton label="Set Time" />
        </div>
        <div>
            <AppText text={`${timeZone}`} variant='lead' />
        </div>
    </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10" classNameHeader="h-10 pl-6 flex flex-row text-center items-center"
            classNameBody="bg-white w-96" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default TimeCard;