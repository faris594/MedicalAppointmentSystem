import UserInfo from './UserInfo';
import LogoutButton from './LogoutButton';
import { FaHome, FaCalendarAlt, FaUser, FaUsers, FaClock, FaBriefcaseMedical } from 'react-icons/fa';

interface DoctorDashboardProps {
    userData: { id: number; email: string; user_type: 'doctor'; name?: string; phone?: string; dob?: string; city?: string; doctor?: { specialty?: string; description?: string } } | null;
}

export default function DoctorDashboard({ userData }: DoctorDashboardProps) {
    return (
        <div className="flex min-h-screen w-full bg-gray-100">
            {/* Sidebar Content */}
            <aside className="w-64 bg-gradient-to-br from-gray-800 to-teal-500 p-6 shadow-md h-screen text-white flex flex-col">
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
                    <li>
                        <a
                            href="/support"
                            className="flex items-center p-3 rounded-lg hover:bg-teal-600 transition-colors duration-200"
                        >
                            <FaCalendarAlt className="mr-3 text-xl" />
                            <span>Support</span>
                        </a>
                    </li>
                </ul>

                {/* Logout */}
                <div className="mt-auto">
                    <LogoutButton />
                </div>
            </aside>

            {/* Dashboard Content */}
            <main className="flex-1 p-5">
                <div className="max-w-4xl mx-auto pl-15">
                    <h1 className="text-3xl font-bold text-teal-600 mb-6">Doctor Interface</h1>
                    <p className="text-gray-600 mb-8">
                        Welcome back, {userData && userData.name ? userData.name : 'Doctor'}!
                    </p>

                    {/* User Info Section */}
                    <UserInfo userData={userData} />

                    {/* Doctor Additional Info Section */}
                    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
                        <h2 className="text-xl font-semibold text-teal-600 mb-4">Doctor Details</h2>
                        <p className="text-gray-700 mb-2">
                            <strong>Specialty:</strong> {userData?.doctor?.specialty || 'Not specified'}
                        </p>
                        <p className="text-gray-600">
                            <strong>Description:</strong> {userData?.doctor?.description || 'No description available'}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
