"use client"

import { List, ListItem, ListItemPrefix, Radio, Typography } from "@material-tailwind/react";
import AppText from './AppText';
import AppRadioButton from './AppRadioButton';
import { useState } from "react";

interface AppRadioButtonListProps {
    radioButtons: React.JSX.Element[];
    label: string;
    onChange: (index: number, checked: boolean) => void;
    checkedIndex: number;
    className?: string
}

const AppRadioButtonList: React.FC<AppRadioButtonListProps> = ({ radioButtons, label, onChange, checkedIndex, className }) => {

    const radioButtonClass = className ? `${className}` : "flex flex-row inline-block"

    return (
        <div>
            <AppText text={label} variant='h6' />
            <List className={radioButtonClass}>
                {radioButtons.map((radioButton, index) => (
                    <ListItem key={index} className="p-0">
                        <label
                            htmlFor={label} //"vertical-list-react"
                            className="flex w-full cursor-pointer items-center px-3 py-2"
                        >
                            <ListItemPrefix className="mr-3">
                                <AppRadioButton
                                    name="vertical-list"
                                    className="hover:before:opacity-0"
                                    label={""}
                                    index={index}
                                    checked={index === checkedIndex}
                                    onChange={onChange} />
                            </ListItemPrefix>
                            {radioButton}
                        </label>
                    </ListItem>
                ))}
            </List>
        </div >
    )
}

export default AppRadioButtonList;