'use client';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';
import LogoutButton from '../dashboard/LogoutButton';

interface AdminHeaderProps {
    userData: {
        id: number;
        email: string;
        user_type: 'admin';
        name?: string;
        phone?: string;
        dob?: string;
        city?: string;
    } | null;
}

export default function AdminHeader({ userData }: AdminHeaderProps) {
    return (
        <header className="bg-teal-600 text-white px-6 py-4 shadow-md flex justify-between items-center relative">
            {/* Left: Home and Logout Buttons */}
            <div className="absolute left-6 top-4 flex flex-row gap-4 items-center">
                <Link
                    href="/dashboard"
                    className="flex items-center p-3 rounded-lg text-white hover:bg-teal-500 transition-colors duration-200 text-left cursor-pointer"
                >
                    <FaHome className="mr-3 text-xl" />
                    <span>Home</span>
                </Link>
                <LogoutButton />
            </div>

            {/* Center: Logo and Title */}
            <div className="flex items-center justify-center w-full">
                <img src="/images/logo.svg" alt="Health Care Logo" className="w-10 h-10 mr-3" />
                <h1 className="text-xl font-bold">Health Care Admin Dashboard</h1>
            </div>

            {/* Right: Admin Panel Label */}
            <div className="absolute right-6 top-4 text-sm opacity-80">
                Admin Panel
            </div>
        </header>
    );
}
