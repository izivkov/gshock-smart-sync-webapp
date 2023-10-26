"use client"

import { List, ListItem, ListItemPrefix, Radio, Typography } from "@material-tailwind/react";
import AppText from './AppText';
import AppRadioButton from './AppRadioButton';
import AppDatePicker from "./AppDatePicker";
import dayjs, { Dayjs } from "dayjs";
import { Component } from "react";

interface AppRadioButtonListProps {
    radioButtons: React.JSX.Element[];
    label: string;
}

const AppRadioButtonList: React.FC<AppRadioButtonListProps> = ({ radioButtons, label }) => {
    return (
        <div>
            <AppText text={label} variant='paragraph' />
            <List className="flex flex-row inline-block">
                {radioButtons.map((radioButton, index) => (
                    <ListItem className="p-0">
                        <label
                            htmlFor="vertical-list-react"
                            className="flex w-full cursor-pointer items-center px-3 py-2"
                        >
                            <ListItemPrefix className="mr-3">
                                <AppRadioButton
                                    name="vertical-list"
                                    className="hover:before:opacity-0" label={""} />
                            </ListItemPrefix>
                            {radioButton}
                            {/* <Typography
                                color="blue-gray"
                                className="font-medium text-blue-gray-400"
                            >
                                {radioButtonName}
                            </Typography>
                            <AppDatePicker label={""} onTimeSelected={function (time: any): void {
                                throw new Error("Function not implemented.");
                            }} initialDate={dayjs()} open={false} /> */}
                        </label>
                    </ListItem>
                ))}
            </List>
        </div>
    )
}

export default AppRadioButtonList;