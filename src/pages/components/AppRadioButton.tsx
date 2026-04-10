"use client"

import { Radio as MuiRadio } from "@mui/material";
import { useEffect, useState } from "react";

interface AppRadioButtonProps {
  name: string;
  label: string;
  checkedInit: boolean;
  className?: string;
  onChange: (index: number, checked: boolean) => void;
  index: number;
  disaabled?: boolean;
}

const AppRadioButton: React.FC<AppRadioButtonProps> = ({ name, label, checkedInit, onChange, index, disaabled }) => {
  const [checked, setChecked] = useState(checkedInit);

  useEffect(() => {
    setChecked(checkedInit);
  }, [checkedInit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, e.target.checked);
  };

  return (
    <MuiRadio
      name={name}
      checked={checked}
      onChange={handleChange}
      disabled={disaabled}
      disableRipple
      size="small"
      sx={{ p: 0, color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }}
    />
  );
};

export default AppRadioButton;
