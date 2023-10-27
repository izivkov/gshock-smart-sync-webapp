"use client"

import { Typography } from "@material-tailwind/react";

interface TextProps {
  text: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'lead' | 'paragraph';
  disabled?: boolean
}

const AppText: React.FC<TextProps> = ({ text, variant = 'lead', disabled }) => {
  return (
    <Typography disabled={disabled} variant={variant}>{text}</Typography>
  )
}

export default AppText;
