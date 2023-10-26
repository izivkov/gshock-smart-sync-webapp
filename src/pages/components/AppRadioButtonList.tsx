"use client"

import { List, ListItem, ListItemPrefix, Radio, Typography } from "@material-tailwind/react";
import AppText from './AppText';
import AppRadioButton from './AppRadioButton';

interface AppRadioButtonListProps {
    radioButtons: React.JSX.Element[];
    label: string;
    onChange: (index: number, checked: boolean) => void;
}

const AppRadioButtonList: React.FC<AppRadioButtonListProps> = ({ radioButtons, label, onChange }) => {

    return (
        <div>
            <AppText text={label} variant='paragraph' />
            <List className="flex flex-row inline-block">
                {radioButtons.map((radioButton, index) => (
                    <ListItem className="p-0">
                        <label
                            htmlFor="vertical-list-react"
                            className="flex w-full cursor-pointer items-center px-3 py-2">
                            <ListItemPrefix className="mr-3">
                                <AppRadioButton
                                    name="vertical-list"
                                    className="hover:before:opacity-0" label={""}
                                    index={index}
                                    onChange={onChange} />
                            </ListItemPrefix>
                            {radioButton}
                        </label>
                    </ListItem>
                ))}
            </List>
        </div>
    )
}

export default AppRadioButtonList;