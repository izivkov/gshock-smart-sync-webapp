"use client"

import { List, ListItem, ListItemPrefix, Radio, Typography } from "@material-tailwind/react";
import AppText from './AppText';
import AppRadioButton from './AppRadioButton';

interface AppRadioButtonListProps {
    radioButtons: React.JSX.Element[];
    label: string;
    onChange: (index: number, checked: boolean) => void;
    checkedIndex: number;
    orientation: "horizontal" | "vertical";
    name: string
}

const AppRadioButtonList: React.FC<AppRadioButtonListProps> = ({ radioButtons, label, onChange, checkedIndex, orientation, name }) => {

    const radioButtonClass = orientation === "vertical" ? "flex flex-col inline-block" : "flex flex-row";

    return (
        <div className="flex flex-row w-full justify-between items-center">
            <AppText text={label} variant='h6' />
            <List className={radioButtonClass}>
                {radioButtons.map((radioButton, index) => (
                    <ListItem key={index} className="p-0 justify-end">
                        <ListItemPrefix className="gap-0">
                            <AppRadioButton
                                name={name}
                                className="hover:before:opacity-0"
                                label={""}
                                index={index}
                                checked={index === checkedIndex}
                                onChange={onChange} />
                        </ListItemPrefix>
                        {radioButton}
                    </ListItem>
                ))
                }
            </List >
        </div >
    )
}

export default AppRadioButtonList;