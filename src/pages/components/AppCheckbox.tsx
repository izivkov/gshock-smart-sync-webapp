"use client"

import { Checkbox } from "@material-tailwind/react";
import { useState } from "react";
import AppText from "./AppText";

interface AppCheckboxProps {
  text?: string;
  checked: boolean;
  className?: string;
  onChange: (e: any) => void;
  id: string;
}

const AppCheckbox: React.FC<AppCheckboxProps> = ({ text, checked, className, onChange, id }) => {

  const [checkboxState, setCheckboxState] = useState(checked);

  const toggleCheckbox = (e: any) => {
    setCheckboxState(!checkboxState); // Toggle the state when the Switch is clicked.
    onChange(e);
  };

  const checkboxClass = className ? className : "p-0";

  return (
    <div className="flex flex-row justify-between gap-0 items-center">
      <AppText text={text ? text : ""} />
      <Checkbox color="purple" id={id} checked={checkboxState} className={checkboxClass} onChange={toggleCheckbox} containerProps={{
        className: checkboxClass,
      }}
      />
    </div >
  )
}

export default AppCheckbox;
