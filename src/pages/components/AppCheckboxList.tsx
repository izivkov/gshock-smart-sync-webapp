"use client"

import React, { Component } from 'react';

import { Checkbox, List, ListItem, ListItemPrefix, Typography } from "@material-tailwind/react";
import AppText from './AppText';
import AppCheckbox from './AppCheckbox';
import { CheckboxValueObject } from '@components/AppCheckbox';

interface AppCheckboxListProps {
    checkBoxValues: CheckboxValueObject[];
    label: string;
    onChange: (selectedValues: Set<string>) => void;
}

const AppCheckboxList: React.FC<AppCheckboxListProps> = ({ checkBoxValues, label, onChange }) => {

    const selectedSet: Set<string> = new Set();

    const toggleCheckbox = (e: any) => {
        if (e.checked) {
            selectedSet.add(e.value);
        } else {
            selectedSet.delete(e.value);
        }
        onChange(selectedSet)
    }

    return (
        <div>
            <AppText text={label} variant='paragraph' />
            <List className="flex flex-row inline-block">
                {checkBoxValues.map((checkBoxValue: CheckboxValueObject, index: number) => (
                    <ListItem className="p-0" key={index}>
                        <label
                            htmlFor={checkBoxValue.displayValue}
                            className="flex w-full cursor-pointer items-center px-3 py-2"
                        >
                            <ListItemPrefix className="p-0 hover:before:opacity-0">
                                <AppCheckbox value={checkBoxValue.value} text={""} checked={false} onChange={toggleCheckbox} />
                            </ListItemPrefix>
                            <Typography color="blue-gray" className="font-medium">
                                {checkBoxValue.displayValue}
                            </Typography>
                        </label>
                    </ListItem>
                ))}
            </List>
        </div>
    )
}

export default AppCheckboxList;