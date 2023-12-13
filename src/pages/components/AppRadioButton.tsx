"use client"

import { Checkbox, Radio } from "@material-tailwind/react";
import { on } from "events";
import { useEffect, useState } from "react";

interface AppRadioButtonProps {
  name: string;
  label: string;
  checkedInit: boolean;
  className?: string;
  onChange: (index: number, checked: boolean) => void;
  index: number;
  disaabled?: boolean
}

const AppRadioButton: React.FC<AppRadioButtonProps> = ({ name, label, checkedInit, className, onChange, index, disaabled }) => {

  const [checked, setChecked] = useState(checkedInit);

  useEffect(() => {
    setChecked(checkedInit);
  }, [checkedInit]);

  const toggleCheckbox = (e: any) => {
    onChange(index, e.target.checked);
  };

  const rasioButtonClass = className ? className : "hover:before:opacity-0 p-0";

  return (
    <Radio
      name={name}
      ripple={false}
      className={rasioButtonClass}
      containerProps={{
        className: "p-0",
      }}
      label={label}
      onChange={toggleCheckbox}
      defaultChecked={checked}
      checked={checked}
      disabled={disaabled}
    />
  )
}

export default AppRadioButton;
