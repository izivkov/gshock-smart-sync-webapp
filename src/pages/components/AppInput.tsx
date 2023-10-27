"use client"

import { Input } from "@material-tailwind/react";
import { size } from "@material-tailwind/react/types/components/input";
import { useEffect, useState } from "react";

interface AppInputProps {
  label?: string;
  type?: string;
  onChange?: (e: any) => void;
  className?: string;
  initialValue?: string;
  size?: size;
  disabled?: boolean
}

const AppInput: React.FC<AppInputProps> = ({ label, type, onChange, className, initialValue, size, disabled }) => {
  const [inputText, setInputText] = useState(initialValue);
  const [disabledState, setDisabled] = useState(disabled);

  useEffect(() => {
    setDisabled(disabled);
  }, [disabled]);

  if (!className) {
    className = "p-0";
  }

  if (!size) {
    size = "md";
  }

  const onChangeValue = (e: any) => {
    setInputText(e.target.value);

    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={className}>
      <Input disabled={disabledState} size={size} type={type} label={label} onChange={onChangeValue} value={inputText} />
    </div>
  )
}

export default AppInput;
function componentDidUpdate(prevProps: any) {
  throw new Error("Function not implemented.");
}

