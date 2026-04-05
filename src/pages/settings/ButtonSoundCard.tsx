"use client"

import React, { useEffect, useState } from 'react';
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import AppSwitch from '../components/AppSwitch';

interface ButtonSoundCardProps {
    buttonSoundInit: boolean,
    onChange: (buttonSound: boolean) => void;
}

const ButtonSoundCard: React.FC<ButtonSoundCardProps> = ({ buttonSoundInit, onChange }) => {

    const [bittonSound, setButtonSound] = useState<boolean>(buttonSoundInit);

    useEffect(() => {
        setButtonSound(buttonSoundInit);
    }, [buttonSoundInit]);

    const onButtonSoundChange = (value: boolean): void => {
        setButtonSound(value);
        onChange(value);
    }

    const body =
        <div className="flex flex-row w-full justify-between items-center py-1.5 px-4 bg-white rounded-xl">
            <AppText text="Button Sound" variant='h6' />
            <AppSwitch initialValue={bittonSound} onChange={onButtonSoundChange} />
        </div>

    return (
        <AppCard header={<></>} body={body} footer={<></>} />
    );
}

export default ButtonSoundCard;