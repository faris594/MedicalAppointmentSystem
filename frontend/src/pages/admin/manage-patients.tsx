import React, { useState, useEffect } from 'react';
import AdminHeader from '../../components/sidebar/AdminHeader';

interface Patient {
    id: number;
    name: string;
    email: string;
    city: string;
    number: string;
    dob: string;
}

interface PatientsProps {
    userData?: { name?: string; email?: string; phone?: string; dob?: string; city?: string } | null;
}

export default function Patients({ userData }: PatientsProps) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Default patient data if fetching fails
    const defaultPatients: Patient[] = [
        { id: 1, name: "not fetched", email: "not fetched", city: "not fetched", number: "not fetched", dob: "not fetched" },
    ];

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch patients: ${response.statusText}`);
                }

                const data: Patient[] = await response.json();
                setPatients(data.length > 0 ? data : defaultPatients);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                setPatients(defaultPatients);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
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
                        Patients
                    </h2>
                    {loading ? (
                        <p className="text-gray-600 text-center">Loading...</p>
                    ) : error ? (
                        <p className="text-red-500 text-center">{error}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                <tr className="bg-teal-600 text-white">
                                    <th className="p-3 border border-gray-300 text-left">Name</th>
                                    <th className="p-3 border border-gray-300 text-left">Email</th>
                                    <th className="p-3 border border-gray-300 text-left">City</th>
                                    <th className="p-3 border border-gray-300 text-left">Number</th>
                                    <th className="p-3 border border-gray-300 text-left">Date of Birth</th>
                                </tr>
                                </thead>
                                <tbody>
                                {patients.map((patient) => (
                                    <tr key={patient.id} className="border border-gray-300">
                                        <td className="p-3 border border-gray-300 text-gray-800">{patient.name}</td>
                                        <td className="p-3 border border-gray-300 text-gray-800">{patient.email}</td>
                                        <td className="p-3 border border-gray-300 text-gray-800">{patient.city}</td>
                                        <td className="p-3 border border-gray-300 text-gray-800">{patient.number}</td>
                                        <td className="p-3 border border-gray-300 text-gray-800">{patient.dob}</td>
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