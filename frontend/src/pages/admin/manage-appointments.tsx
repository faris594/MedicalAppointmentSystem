import React, { useState, useEffect } from 'react';
import AdminHeader from '../../components/sidebar/AdminHeader';

interface Appointment {
    id: number;
    doctorName: string;
    patientName: string;
    date: string;
    time: string;
    state: string;
}

interface AppointmentsProps {
    userData?: { name?: string; email?: string; phone?: string; dob?: string; city?: string } | null;
}

export default function Appointments({ userData }: AppointmentsProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Default appointment data if fetching fails
    const defaultAppointments: Appointment[] = [
        {
            id: 1,
            doctorName: "Unknown Doctor",
            patientName: "Unknown Patient",
            date: "N/A",
            time: "N/A",
            state: "Unknown",
        },
    ];

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch appointments: ${response.statusText}`);
                }

                const data: Appointment[] = await response.json();
                setAppointments(data.length > 0 ? data : defaultAppointments);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                setAppointments(defaultAppointments);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const handleSave = () => {
        alert('Save button clicked!');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col w-full">
            {/* Header */}
            <AdminHeader userData={userData} />

            {/* Main Content */}
            <main className="flex-1 p-6 pt-24 flex justify-center">
                <div className="max-w-5xl w-full bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-semibold text-teal-600 mb-6 text-center">
                        Appointments
                    </h2>
                    {loading ? (
                        <p className="text-gray-600 text-center">Loading...</p>
                    ) : error ? (
                        <div className="text-center">
                            <p className="text-red-500">{error}</p>
                            <button
                                onClick={() => fetchAppointments()}
                                className="mt-2 bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                <tr className="bg-teal-600 text-white">
                                    <th className="p-3 border border-gray-300 text-left">Doctor Name</th>
                                    <th className="p-3 border border-gray-300 text-left">Patient Name</th>
                                    <th className="p-3 border border-gray-300 text-left">Date</th>
                                    <th className="p-3 border border-gray-300 text-left">Time</th>
                                    <th className="p-3 border border-gray-300 text-left">State</th>
                                </tr>
                                </thead>
                                <tbody>
                                {appointments.map((appointment) => (
                                    <tr key={appointment.id} className="border border-gray-300">
                                        <td className="p-3 border border-gray-300 text-gray-800">{appointment.doctorName}</td>
                                        <td className="p-3 border border-gray-300 text-gray-800">{appointment.patientName}</td>
                                        <td className="p-3 border border-gray-300 text-gray-800">{appointment.date}</td>
                                        <td className="p-3 border border-gray-300 text-gray-800">{appointment.time}</td>
                                        <td className="p-3 border border-gray-300 text-gray-800">{appointment.state}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="mt-6 text-right">
                        <button
                            onClick={handleSave}
                            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}