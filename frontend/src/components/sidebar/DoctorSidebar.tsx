'use client';
import { FaHome, FaCalendarAlt, FaClock } from 'react-icons/fa';
import LogoutButton from '../dashboard/LogoutButton';

interface DoctorSidebarProps {
    userData: {
        id: number;
        email: string;
        user_type: 'doctor';
        name?: string;
        phone?: string;
        dob?: string;
        city?: string;
        doctor?: {
            specialty?: string;
            description?: string;
        };
    } | null;
}

export default function DoctorSidebar({ userData }: DoctorSidebarProps) {
    return (
        <aside className="w-64 bg-gradient-to-br from-gray-500 to-teal-700 p-6 shadow-md h-screen text-white flex flex-col">
            {/* Logo Section */}
            <div className="flex items-center mb-8">
                <img src="/images/logo.svg" alt="Health Care Logo" className="w-12 h-12 mr-3" />
                <h1 className="text-2xl font-bold">Health Care</h1>
            </div>

            {/* Welcome Message */}
            {userData?.email && (
                <div className="mb-6">
                    <p className="text-sm opacity-90">Welcome, {userData.email}</p>
                </div>
            )}

            {/* Navigation Links */}
            <ul className="space-y-3 flex-1">
                <li>
                    <a
                        href="/dashboard"
                        className="flex items-center p-3 rounded-lg hover:bg-teal-600 transition-colors duration-200"
                    >
                        <FaHome className="mr-3 text-xl" />
                        <span>Home</span>
                    </a>
                </li>
                <li>
                    <a
                        href="/schedule"
                        className="flex items-center p-3 rounded-lg hover:bg-teal-600 transition-colors duration-200"
                    >
                        <FaClock className="mr-3 text-xl" />
                        <span>Schedule</span>
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
