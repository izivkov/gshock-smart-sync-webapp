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

    const header = <div className="flex flex-row w-full justify-between items-center pl-4 pr-4">
        <AppText text="Button Sound" variant='h5' />
    </div>

    const body =
        <div className="flex flex-row w-full justify-between items-center">
            <AppText text="Button Operation Tone" variant='paragraph' />
            <AppSwitch initialValue={bittonSound} onChange={onButtonSoundChange} />
        </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} />
    );
}

export default ButtonSoundCard;