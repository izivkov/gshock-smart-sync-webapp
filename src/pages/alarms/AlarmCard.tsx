"use client"

import AppCard from "@components/AppCard";
import AppText from "../components/AppText";
import AlarmTime from "./AlarmTime";
import AppPeriod from "../components/AppPeriod";
import AppSwitch from "../components/AppSwitch";

interface AlarmCardProps {
    number: 1 | 2 | 3 | 4 | 5;
}

const AlarmCard: React.FC<AlarmCardProps> = ({ number }) => {

    const title = `Alarm ${number}`

    const header = <div className="flex flex-row justify-between">
        <AppText text={title} variant='h5' />
    </div>

    const body = <div className="flex flex-row items-center justify-between">
        <div className="flex gap-6 items-center">
            <div onClick={() => alert("clicked")}>
                <AlarmTime />
            </div>
            <AppPeriod period="Daily" />
        </div>
        <div className="flex justify-end">
            <AppSwitch checked={true} />
        </div>
    </div >

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10" classNameHeader="h-10 pl-6 flex flex-row text-center items-center"
            classNameBody="bg-white" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default AlarmCard;