"use client"

import React, { Component, useEffect, useState } from 'react';

import { Checkbox, List, ListItem, ListItemPrefix, Typography } from "@material-tailwind/react";
import AppText from './AppText';
import AppCheckbox from './AppCheckbox';

interface AppCheckboxListProps {
    displayValues: string[];
    label: string;
    preSelected: string[]
    onChange: (selected: string[]) => void;
    className?: string
}

const AppCheckboxList: React.FC<AppCheckboxListProps> = ({ displayValues, label, onChange, className, preSelected }) => {

    const [daysOfWeek, setDaysOfWeek] = useState(preSelected);
    const [selectedSet, setSelectedSet] = useState(new Set<string>(preSelected));

    useEffect(() => {
        setDaysOfWeek(preSelected)
        setSelectedSet(new Set<string>(preSelected))
    }, [preSelected]);

    const toggleCheckbox = (checked: boolean, index: number) => {
        if (checked) {
            selectedSet.add(displayValues[index]);
        } else {
            selectedSet.delete(displayValues[index]);
        }
        onChange(Array.from(selectedSet.values()));
    }

    const checkboxClass = className ? `${className}` : "flex inline-block"

    return (
        <div>
            <AppText text={label} variant='h6' />
            <List className={className}>
                {displayValues.map((displayValue: string, index: number) => (
                    <ListItem className="p-0" key={index}>
                        <label
                            htmlFor={displayValue}
                            className="flex w-full cursor-pointer items-center px-3 py-2"
                        >
                            <ListItemPrefix className="p-0 hover:before:opacity-0">
                                <AppCheckbox text={""} checked={daysOfWeek.includes(displayValue)} index={index} onChange={toggleCheckbox} />
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