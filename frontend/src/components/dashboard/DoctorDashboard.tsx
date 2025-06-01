import UserInfo from './UserInfo';
import DoctorSidebar from '../sidebar/DoctorSidebar';

interface DoctorDashboardProps {
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

export default function DoctorDashboard({ userData }: DoctorDashboardProps) {
    return (
        <div className="flex min-h-screen w-full bg-gray-100">
            {/* Sidebar Component */}
            <DoctorSidebar userData={userData} />

            {/* Dashboard Content */}
            <main className="flex-1 p-5">
                <div className="max-w-4xl mx-auto pl-15">
                    <h1 className="text-3xl font-bold text-teal-600 mb-6">Doctor Interface</h1>
                    <p className="text-gray-600 mb-8">
                        Welcome back, {userData && userData.name ? userData.name : 'Doctor'}!
                    </p>

                    {/* User Info */}
                    <UserInfo userData={userData} />

                    {/* Doctor Details */}
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
