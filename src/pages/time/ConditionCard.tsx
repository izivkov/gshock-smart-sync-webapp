"use client"

import AppCard from "@components/AppCard";
import AppText from "../components/AppText";
import BatteryLevel from "./BatteryLevel";

const ConditionCard: React.FC = () => {

    const batteryLevel = 11;
    const temperature = 24;

    const header = <div className="flex flex-row justify-between">
        <AppText text="Watch Condition" variant='h5' />
    </div>

    const body = <div>
        <div className="space-y-4">
            <div className="flex flex-row justify-center">
                <BatteryLevel level={batteryLevel} />
            </div>
            <div className="flex flex-row justify-center top-4">
                <AppText text={`${temperature}ºC`} variant='h4' />
            </div>
        </div>
    </div >

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10"
            classNameHeader="h-10 pl-6 flex flex-row text-center items-center"
            classNameBody="bg-white w-96" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default ConditionCard;