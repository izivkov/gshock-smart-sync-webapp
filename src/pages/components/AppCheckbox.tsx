"use client"

import { Checkbox } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import AppText from "./AppText";

interface AppCheckboxProps {
  text?: string;
  checked: boolean;
  index?: number;
  className?: string;
  onChange: (checked: boolean, index: number) => void;
}

const AppCheckbox: React.FC<AppCheckboxProps> = ({ text, checked, className, onChange, index }) => {

  const [checkboxState, setCheckboxState] = useState(checked);

  useEffect(() => {
    setCheckboxState(checked);
  }, [checked]);

  const toggleCheckbox = (e: any) => {
    setCheckboxState(!checkboxState);
    if (index) {
      onChange(e.target.checked, index);
    }
  }

  const checkboxClass = className ? className : "p-0";

  return (
    <div className="flex flex-row justify-between gap-0 items-center inline-block">
      <AppText text={text ? text : ""} />
      <Checkbox color="purple" checked={checkboxState} className={checkboxClass} onChange={toggleCheckbox} containerProps={{
        className: checkboxClass,
      }}
      />
    </div >
  )
}

export default AppCheckbox;

