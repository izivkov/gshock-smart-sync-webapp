"use client"

import { List, ListItem, ListItemIcon } from "@mui/material";
import AppText from './AppText';
import AppRadioButton from './AppRadioButton';
import { useEffect, useState } from "react";

interface AppRadioButtonListProps {
    radioButtons: React.JSX.Element[];
    label: string;
    onChange: (index: number, checked: boolean) => void;
    selectedIndexInit: number;
    orientation: "horizontal" | "vertical";
    name: string;
}

const AppRadioButtonList: React.FC<AppRadioButtonListProps> = ({ radioButtons, label, onChange, selectedIndexInit, orientation, name }) => {
    const [selectedIndex, setSelectedIndex] = useState(selectedIndexInit);

    useEffect(() => {
        setSelectedIndex(selectedIndexInit);
    }, [selectedIndexInit]);

    const handleChange = (index: number, checked: boolean) => {
        if (checked) setSelectedIndex(index);
        onChange(index, checked);
    };

    return (
        <div className="flex flex-row w-full justify-between items-center">
            <AppText text={label} variant='h6' />
            <List
                disablePadding
                sx={{ display: 'flex', flexDirection: orientation === 'vertical' ? 'column' : 'row', gap: 0 }}
            >
                {radioButtons.map((radioButton, index) => (
                    <ListItem key={index} disablePadding sx={{ justifyContent: 'flex-start', width: 'auto' }}>
                        <ListItemIcon sx={{ minWidth: 'auto' }}>
                            <AppRadioButton
                                name={name}
                                label=""
                                index={index}
                                checkedInit={index === selectedIndex}
                                onChange={handleChange}
                            />
                        </ListItemIcon>
                        {radioButton}
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default AppRadioButtonList;