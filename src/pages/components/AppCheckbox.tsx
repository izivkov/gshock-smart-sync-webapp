"use client"

import { Checkbox } from "@material-tailwind/react";
import { useState } from "react";
import AppText from "./AppText";

interface AppCheckboxProps {
  text?: string;
  checked: boolean;
  className?: string;
}

const AppCheckbox: React.FC<AppCheckboxProps> = ({ text, checked, className }) => {

  const [checkboxState, setCheckboxState] = useState(checked);

  const toggleCheckbox = () => {
    setCheckboxState(!checkboxState); // Toggle the state when the Switch is clicked.
  };

  const checkboxClass = className ? className : "p-0";

  return (
    <div className="flex flex-row justify-between gap-0 items-center">
      <AppText text={text ? text : ""} />
      <Checkbox color="purple" checked={checkboxState} onChange={toggleCheckbox} containerProps={{
        className: checkboxClass,
      }}
      />
    </div >
  )
}

export default AppCheckbox;
