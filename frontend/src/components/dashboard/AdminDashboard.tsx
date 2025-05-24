import { useRouter } from 'next/router';
import UserInfo from './UserInfo';
import LogoutButton from './LogoutButton';
import AdminHeader from '../sidebar/AdminHeader';

interface AdminDashboardProps {
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

export default function AdminDashboard({ userData }: AdminDashboardProps) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col w-full">
            {/* Header */}
            <AdminHeader userData={userData} />

            {/* Main Content */}
            <main className="flex-1 py-10 px-4 flex justify-center">
                <div className="w-full max-w-5xl space-y-12">
                    {/* Welcome */}
                    <div className="text-center">
                        <h2 className="text-3xl font-semibold text-teal-700 mb-2">Welcome, Admin</h2>
                        <p className="text-gray-600">Manage users, appointments, and system settings below.</p>
                    </div>

                    {/* Button Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        <SectionButton
                            label="Create Doctor"
                            backgroundImage="/images/CreateIcon.png"
                            onClick={() => router.push('/admin/create-doctor')}
                        />
                        <SectionButton
                            label="Manage Patients"
                            backgroundImage="/images/PatientsIcon.png"
                            onClick={() => router.push('/admin/manage-patients')}
                        />
                        <SectionButton
                            label="Manage Doctors"
                            backgroundImage="/images/DoctorsIcon.png"
                            onClick={() => router.push('/admin/manage-doctors')}
                        />
                        <SectionButton
                            label="Appointments"
                            backgroundImage="/images/ScheduleIcon.png"
                            onClick={() => router.push('/admin/manage-appointments')}
                        />
                        <SectionButton
                            label="Reports"
                            backgroundImage="/images/ReportIcon.png"
                            onClick={() => router.push('/admin/reports')}
                        />
                        <SectionButton
                            label="System Settings"
                            backgroundImage="/images/SettingsIcon.png"
                            onClick={() => router.push('/admin/settings')}
                        />
                    </div>

                    {/* User Info */}
                    <div>
                        <UserInfo userData={userData} />
                    </div>
                </div>
            </main>
        </div>
    );
}

function SectionButton({
                           label,
                           backgroundImage,
                           onClick,
                       }: {
    label: string;
    backgroundImage?: string;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="group focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg p-4 bg-white shadow hover:shadow-lg transition-all duration-200 flex flex-col items-center"
        >
            <div
                className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-cover bg-center mb-3"
                style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined }}
                aria-hidden="true"
            />
            <span className="text-sm font-medium text-gray-800 group-hover:text-teal-600">
                {label}
            </span>
        </button>
    );
}
