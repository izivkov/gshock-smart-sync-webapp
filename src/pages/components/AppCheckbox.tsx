"use client"

import { Checkbox } from "@material-tailwind/react";
import { useState } from "react";
import AppText from "./AppText";

interface AppCheckboxProps {
  text?: string;
  checked: boolean;
  className?: string;
  onChange: (status: { checked: boolean, value: string }) => void;
  value: string;
}

const AppCheckbox: React.FC<AppCheckboxProps> = ({ text, checked, className, onChange, value }) => {

  const [checkboxState, setCheckboxState] = useState(checked);

  const toggleCheckbox = (e: any) => {
    onChange({ checked: !checkboxState, value: value });
    setCheckboxState(!checkboxState);
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

interface CheckboxValueObject {
  value: string;
  displayValue: string;
}

export type { CheckboxValueObject }
