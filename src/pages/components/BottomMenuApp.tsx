"use client"

// components/BottomNavigationMenu.js
import { useRouter } from 'next/router';
import TimeIcon from '@mui/icons-material/AccessTime';
import AlarmsIcon from '@mui/icons-material/Alarm';
import CalenderIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuItemApp from './MenuItemApp';

interface BottomMenuProps {
    props: any
}

const BottomMenuApp: React.FC<BottomMenuProps> = ({ props }) => {
    const router = useRouter();

    return (
        <div className='fixed bottom-0 w-full p-4 pointer-events-none'>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 glass-card p-4 pointer-events-auto max-w-7xl mx-auto border-t border-white/20">
                <div onClick={() => router.push('/time/Time')} className="cursor-pointer">
                    <MenuItemApp title="Time" description="Manage your time" icon={<TimeIcon />} />
                </div>
                <div onClick={() => router.push('/alarms/Alarms')} className="cursor-pointer">
                    <MenuItemApp title="Alarms" description="Manage your alarms" icon={<AlarmsIcon />} />
                </div>
                <div onClick={() => router.push('/reminders/Reminders')} className="cursor-pointer">
                    <MenuItemApp title="Reminders" description="Manage your reminders" icon={<CalenderIcon />} />
                </div>
                <div onClick={() => router.push('/settings/Settings')} className="cursor-pointer">
                    <MenuItemApp title="Settings" description="Manage your settings" icon={<SettingsIcon />} />
                </div>
            </div>
        </div>
    );
}

export default BottomMenuApp;
