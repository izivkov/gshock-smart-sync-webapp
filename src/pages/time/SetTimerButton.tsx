"use client"

import AppButton from '../components/AppButton';

interface SetTimerButtonProps {
    label: string;
}

const SetTimerButtonProps: React.FC<SetTimerButtonProps> = ({ label }) => {

    const setTimer: () => void = () => {
        alert("Set Timer Clicked")
    }

    return (
        <AppButton label={label} onClick={setTimer} />
    )
}

export default SetTimerButtonProps;