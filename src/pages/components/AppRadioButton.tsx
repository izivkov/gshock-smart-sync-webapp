"use client"

import { Checkbox, Radio } from "@material-tailwind/react";
import { useState } from "react";

interface AppRadioButtonProps {
  name: string;
  label: string;
  checked?: boolean;
  className?: string;
}

const AppRadioButton: React.FC<AppRadioButtonProps> = ({ name, label, checked, className }) => {

  const [checkboxState, setCheckboxState] = useState(checked);

  const toggleCheckbox = () => {
    setCheckboxState(!checkboxState); // Toggle the state when the Switch is clicked.
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
    />
  )
}

export default AppRadioButton;
