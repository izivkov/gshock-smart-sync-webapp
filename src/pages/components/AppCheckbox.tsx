"use client"

import { Checkbox } from "@material-tailwind/react";
import { useState } from "react";
import AppText from "./AppText";

interface AppCheckboxProps {
  text?: string;
  checked: boolean;
}

const AppCheckbox: React.FC<AppCheckboxProps> = ({ text, checked }) => {

  const [checkboxState, setCheckboxState] = useState(checked);

  const toggleCheckbox = () => {
    setCheckboxState(!checkboxState); // Toggle the state when the Switch is clicked.
  };

  return (
    <div className="flex flex-row justify-between gap-6 items-center">
      <AppText text={text ? text : ""} />
      <Checkbox color="purple" checked={checkboxState} onChange={toggleCheckbox}
      />
    </div >
  )
}

export default AppCheckbox;
