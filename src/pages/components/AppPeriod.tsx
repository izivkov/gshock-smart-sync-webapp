"use client"

import AppText from "./AppText";

interface AppPeriodProps {
  period: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
}

const AppPeriod: React.FC<AppPeriodProps> = ({ period }) => {
  return (
    <AppText text={period} />
  )
}

export default AppPeriod;
