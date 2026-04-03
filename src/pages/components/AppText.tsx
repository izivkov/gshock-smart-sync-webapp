"use client"

import { Typography } from "@material-tailwind/react";
import { useEffect, useState } from "react";

interface TextProps {
  text: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'lead' | 'paragraph';
  disabled?: boolean;
  className?: string;
}

const AppText: React.FC<TextProps> = ({ text, variant = 'paragraph', disabled, className }) => {
  const [textValue, setTextValue] = useState(text);

  useEffect(() => {
    setTextValue(text);
  }, [text]);

  return (
    <Typography
      variant={variant}
      className={`font-medium ${disabled ? 'opacity-50' : ''} ${className || ''}`}
      style={{ color: 'inherit' }}
    >
      {textValue}
    </Typography>
  )
}

export default AppText;
