"use client"

import { Checkbox, Radio } from "@material-tailwind/react";
import { on } from "events";
import { useState } from "react";

interface AppRadioButtonProps {
  name: string;
  label: string;
  checked: boolean;
  className?: string;
  onChange: (index: number, checked: boolean) => void;
  index: number;
  disaabled?: boolean
}

const AppRadioButton: React.FC<AppRadioButtonProps> = ({ name, label, checked, className, onChange, index, disaabled }) => {

  const toggleCheckbox = (e: any) => {
    onChange(index, e.target.checked);
  };

  const checkboxClass = className ? className : "hover:before:opacity-0 p-0";

  return (
    <Radio
      name="vertical-list"
      id="vertical-list-react"
      ripple={false}
      className={checkboxClass}
      containerProps={{
        className: "p-0",
      }}
      label={label}
      onChange={toggleCheckbox}
      defaultChecked={checked}
      disabled={disaabled}
    />
  )
}

export default AppRadioButton;
