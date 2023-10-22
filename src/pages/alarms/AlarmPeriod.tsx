"use client"

import AppText from "@components/AppText";

interface AlarmPeriodProps {
  period: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
}

const AlarmPeriod: React.FC<AlarmPeriodProps> = ({ period }) => {
  return (
    <AppText text={period} />
  )
}

export default AlarmPeriod;
