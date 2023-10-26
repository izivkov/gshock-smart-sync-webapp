"use client"

import React, { Component } from 'react';

import { Checkbox, List, ListItem, ListItemPrefix, Typography } from "@material-tailwind/react";
import AppText from './AppText';
import AppCheckbox from './AppCheckbox';

interface AppCheckboxListProps {
    displayValues: string[];
    label: string;
    onChange: (selected: number[]) => void;
}

const AppCheckboxList: React.FC<AppCheckboxListProps> = ({ displayValues, label, onChange }) => {

    const selected = new Set<number>()

    const toggleCheckbox = (checked: boolean, index: number) => {
        if (checked) {
            selected.add(index);
        } else {
            selected.delete(index);
        }
        onChange(Array.from(selected.values()));
    }

    return (
        <div>
            <AppText text={label} variant='paragraph' />
            <List className="flex flex-row inline-block">
                {displayValues.map((displayValue: string, index: number) => (
                    <ListItem className="p-0" key={index}>
                        <label
                            htmlFor={displayValue}
                            className="flex w-full cursor-pointer items-center px-3 py-2"
                        >
                            <ListItemPrefix className="p-0 hover:before:opacity-0">
                                <AppCheckbox text={""} checked={false} index={index} onChange={toggleCheckbox} />
                            </ListItemPrefix>
                            <Typography color="blue-gray" className="font-medium">
                                {displayValue}
                            </Typography>
                        </label>
                    </ListItem>
                ))}
            </List>
        </div>
    )
}

export default AppCheckboxList;