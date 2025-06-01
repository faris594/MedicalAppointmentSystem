import { useEffect, useState } from 'react';
import axios from 'axios';
import UserInfo from './UserInfo';
import PatientSidebar from '../sidebar/PatientSidebar';

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
            <PatientSidebar email={userData?.email} />

            <main className="flex-1 p-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-teal-700 mb-6 tracking-tight">Patient Dashboard</h1>
                    <p className="text-gray-600 mb-10 text-lg">
                        Welcome back, {userData?.name ? userData.name.split(' ')[0] : 'User'}!
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
                                            <p className="text-gray-600">{appt.date} at {appt.time}</p>
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
