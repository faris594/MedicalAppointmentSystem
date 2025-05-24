import { useEffect, useState } from 'react';
import UserInfo from './UserInfo';
import LogoutButton from './LogoutButton';
import { FaHome, FaBriefcaseMedical, FaUser } from 'react-icons/fa';
import axios from 'axios';

interface Appointment {
    id: number;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'canceled';
    doctor: {
        user: {
            name: string;
            email: string;
        };
        specialty?: string;
    };
}

interface PatientDashboardProps {
    userData: {
        id: number;
        email: string;
        user_type: 'patient';
        name?: string;
        phone?: string;
        dob?: string;
        city?: string;
    } | null;
}

export default function PatientDashboard({ userData }: PatientDashboardProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (userData?.id) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/appointments/patient/${userData.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    // Sort appointments by date and time (newest first)
                    const sortedAppointments = res.data.sort((a: Appointment, b: Appointment) => {
                        const dateTimeA = new Date(`${a.date}T${a.time}`);
                        const dateTimeB = new Date(`${b.date}T${b.time}`);
                        return dateTimeB.getTime() - dateTimeA.getTime();
                    });
                    setAppointments(sortedAppointments);
                } catch (error) {
                    console.error('Failed to fetch appointments:', error);
                }
            }
        };

        fetchAppointments();
    }, [userData]);

    // Map appointment status to Tailwind background colors
    const getStatusColor = (status: Appointment['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-50';
            case 'confirmed':
                return 'bg-green-50';
            case 'completed':
                return 'bg-blue-50';
            case 'canceled':
                return 'bg-red-50';
            default:
                return 'bg-gray-50';
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-gray-50">
            <aside className="w-64 bg-gradient-to-br from-gray-800 to-teal-600 p-6 shadow-lg h-screen text-white flex flex-col">
                <div className="flex items-center mb-10">
                    <img src="/images/logo.svg" alt="Health Care Logo" className="w-12 h-12 mr-3" />
                    <h1 className="text-2xl font-bold tracking-tight">Health Care</h1>
                </div>

                {userData?.email && (
                    <div className="mb-8">
                        <p className="text-sm font-medium opacity-90">Welcome, {userData.email}</p>
                    </div>
                )}

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
                    <li>
                        <a href="/profile" className="flex items-center p-3 rounded-lg hover:bg-teal-700 transition-colors">
                            <FaUser className="mr-3 text-xl" />
                            <span className="font-medium">Profile</span>
                        </a>
                    </li>
                </ul>

                <div className="mt-auto">
                    <LogoutButton />
                </div>
            </aside>

            <main className="flex-1 p-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-teal-700 mb-6 tracking-tight">Patient Dashboard</h1>
                    <p className="text-gray-600 mb-10 text-lg">
                        Welcome back, {userData && userData.name ? userData.name.split(' ')[0] : 'User'}!
                    </p>

                    <UserInfo userData={userData} />

                    <div className="mt-10">
                        <h3 className="text-xl font-semibold text-teal-700 mb-6 text-center">Your Appointments</h3>
                        <div className="space-y-6">
                            {appointments.length > 0 ? (
                                appointments.map((appt) => (
                                    <div
                                        key={appt.id}
                                        className={`flex items-center p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow ${getStatusColor(appt.status)}`}
                                    >
                                        <img
                                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(appt.doctor.user.email)}`}
                                            alt="Doctor Avatar"
                                            className="w-14 h-14 rounded-full object-cover mr-5"
                                        />
                                        <div className="flex-1">
                                            <p className="text-lg font-semibold text-gray-800">{appt.doctor.user.name}</p>
                                            <p className="text-gray-600">
                                                {appt.date} at {appt.time}
                                            </p>
                                            <p className="text-gray-500 text-sm font-medium">Status: {appt.status}</p>
                                            <p className="text-gray-500 text-sm">{appt.doctor.specialty || 'General Practitioner'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center text-lg">No appointments found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}