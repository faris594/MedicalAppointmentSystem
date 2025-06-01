import { FaHome, FaBriefcaseMedical, FaUser } from 'react-icons/fa';
import LogoutButton from '../dashboard/LogoutButton';

interface PatientSidebarProps {
    email?: string;
}

export default function PatientSidebar({ email }: PatientSidebarProps) {
    return (
        <aside className="w-64 fixed top-0 left-0 h-screen z-50 bg-gradient-to-br from-gray-500 to-teal-700 p-6 shadow-lg text-white flex flex-col">
            {/* Logo */}
            <div className="flex items-center mb-10">
                <img src="/images/logo.svg" alt="Health Care Logo" className="w-12 h-12 mr-3" />
                <h1 className="text-2xl font-bold tracking-tight">Health Care</h1>
            </div>

            {/* Welcome */}
            {email && (
                <div className="mb-8">
                    <p className="text-sm font-medium opacity-90">Welcome, {email}</p>
                </div>
            )}

            {/* Nav Links */}
            <ul className="space-y-4 flex-1">
                <li>
                    <a href="/dashboard" className="flex items-center p-3 rounded-lg hover:bg-teal-700 transition-colors">
                        <FaHome className="mr-3 text-xl" />
                        <span className="font-medium">Dashboard</span>
                    </a>
                </li>
                <li>
                    <a href="/doctors" className="flex items-center p-3 rounded-lg hover:bg-teal-700 transition-colors">
                        <FaBriefcaseMedical className="mr-3 text-xl" />
                        <span className="font-medium">Doctors</span>
                    </a>
                </li>
            </ul>

            {/* Logout */}
            <div className="mt-auto">
                <LogoutButton />
            </div>
        </aside>
    );
}
