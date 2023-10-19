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
        <div className='fixed bottom-0 w-full text-white'>
            <div className="grid grid-cols-1 gap-4 self-end md:grid-cols-2 lg:grid-cols-4">
                <div onClick={() => router.push('/time/Time')}>
                    <MenuItemApp title="Time" description="Manage your time" icon={<TimeIcon />} />
                </div>

                <div onClick={() => router.push('/alarms/Alarms')}>
                    <MenuItemApp title="Alarms" description="Manage your alarms" icon={<AlarmsIcon />} />
                </div>
                <div onClick={() => router.push('/reminders/Reminders')}>
                    <MenuItemApp title="Reminders" description="Manage your reminders" icon={<CalenderIcon />} />
                </div>
                <div onClick={() => router.push('/settings/Settings')}>
                    <MenuItemApp title="Settings" description="Manage your settings" icon={<SettingsIcon />} />
                </div>
            </div>
        </div>
    );
};

export default BottomMenuApp;
