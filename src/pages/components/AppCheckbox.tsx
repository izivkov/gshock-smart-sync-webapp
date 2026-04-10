"use client"

import { Checkbox as MuiCheckbox } from "@mui/material";
import { useEffect, useState } from "react";
import AppText from "./AppText";

interface AppCheckboxProps {
  text?: string;
  checked: boolean;
  index: number;
  className?: string;
  onChange: (checked: boolean, index: number) => void;
}

const AppCheckbox: React.FC<AppCheckboxProps> = ({ text, checked, className, onChange, index }) => {
  const [checkboxState, setCheckboxState] = useState(checked);

  useEffect(() => {
    setCheckboxState(checked);
  }, [checked]);

  const toggleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxState(e.target.checked);
    onChange(e.target.checked, index);
  };

  return (
    <div className="flex flex-row justify-between gap-0 items-center">
      <AppText text={text ?? ""} />
      <MuiCheckbox
        checked={checkboxState}
        onChange={toggleCheckbox}
        className={className}
        disableRipple
        size="small"
        sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }}
      />
    </div>
  );
};

export default AppCheckbox;
