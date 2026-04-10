"use client"

import { TextField } from "@mui/material";
import { useEffect, useState } from "react";

interface AppInputProps {
  label?: string;
  type?: string;
  onChange?: (e: any) => void;
  className?: string;
  initialValue?: string;
  size?: 'small' | 'medium';
  style?: React.CSSProperties;
  disabled?: boolean;
}

const AppInput: React.FC<AppInputProps> = ({ label, type, onChange, className, initialValue, size = 'small', disabled, style }) => {
  const [inputText, setInputText] = useState(initialValue ?? '');
  const [disabledState, setDisabled] = useState(disabled);

  useEffect(() => {
    setDisabled(disabled);
  }, [disabled]);

  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  return (
    <TextField
      disabled={disabledState}
      size={size}
      style={style}
      type={type}
      label={label}
      onChange={onChangeValue}
      value={inputText}
      className={className}
      variant="outlined"
      slotProps={{ input: { sx: { fontSize: '1rem' } } }}
    />
  );
};

export default AppInput;
