"use client"

import AppButton from '../components/AppButton';
import GShockAPI from "@/api/GShockAPI";

interface SetTimerButtonProps {
    label: string;
    timerValue: { hours: number, minutes: number, seconds: number }
}

const SetTimerButtonProps: React.FC<SetTimerButtonProps> = ({ label, timerValue }) => {

    const setTimer: () => void = () => {
        const timeInSeconds = timerValue.hours * 3600 + timerValue.minutes * 60 + timerValue.seconds;
        GShockAPI.setTimer(timeInSeconds)
    }

    return (
        <AppButton label={label} onClick={setTimer} />
    )
}

export default SetTimerButtonProps;