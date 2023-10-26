"use client"

import React, { Component } from 'react';

import { Checkbox, List, ListItem, ListItemPrefix, Typography } from "@material-tailwind/react";
import AppText from './AppText';
import AppCheckbox from './AppCheckbox';

interface AppCheckboxListProps {
    checkBoxNames: string[];
    label: string;
    onChange: (selectedValues: Set<string>) => void;
}

const AppCheckboxList: React.FC<AppCheckboxListProps> = ({ checkBoxNames, label, onChange }) => {

    const selectedSet: Set<string> = new Set();

    const toggleCheckbox = (e: any) => {
        if (e.target.checked) {
            selectedSet.add(e.target.id);
        } else {
            selectedSet.delete(e.target.id);
        }
        onChange(selectedSet)
    }

    return (
        <div>
            <AppText text={label} variant='paragraph' />
            <List className="flex flex-row inline-block">
                {checkBoxNames.map((checkBoxName: string, index: number) => (
                    <ListItem className="p-0" key={index}>
                        <label
                            htmlFor={checkBoxName}
                            className="flex w-full cursor-pointer items-center px-3 py-2"
                        >
                            <ListItemPrefix className="p-0 hover:before:opacity-0">
                                <AppCheckbox id={checkBoxName} text={""} checked={false} onChange={toggleCheckbox} />
                            </ListItemPrefix>
                            <Typography color="blue-gray" className="font-medium">
                                {checkBoxName}
                            </Typography>
                        </label>
                    </ListItem>
                ))}
            </List>
        </div>
    )
}

export default AppCheckboxList;