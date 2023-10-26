"use client"

import { Input } from "@material-tailwind/react";

interface AppInputProps {
  label?: string;
  type?: string;
  onChange?: (e: any) => void;
  className?: string;
}

const AppInput: React.FC<AppInputProps> = ({ label, type, onChange, className }) => {
  if (!className) {
    className = "p-0";
  }
  return (
    <div className={className}>
      <Input type={type} label={label} onChange={onChange}></Input>
    </div>
  )
}

export default AppInput;
