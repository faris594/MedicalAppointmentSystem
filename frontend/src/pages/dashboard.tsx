'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PatientDashboard from '../components/dashboard/PatientDashboard';
import DoctorDashboard from '../components/dashboard/DoctorDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

export default function Dashboard() {
    const router = useRouter();
    const [userData, setUserData] = useState<{
        id?: number;
        email?: string;
        user_type?: 'patient' | 'doctor' | 'admin';
        name?: string;
        phone?: string;
        dob?: string;
        city?: string;
    } | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, redirecting to login');
            router.push('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                console.log('Fetching user data with token:', token);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                console.log('Response from /profile:', { status: response.status, data });

                if (response.ok) {
                    setUserData(data);
                } else {
                    setError(data.message || `Failed to fetch user data (Status: ${response.status})`);
                    localStorage.removeItem('token');
                    router.push('/login');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Something went wrong while fetching user data');
                localStorage.removeItem('token');
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    // Render the appropriate dashboard based on user_type
    return (
        <div className="flex min-h-screen bg-gray-100">
            {userData?.user_type === 'patient' ? (
                <PatientDashboard userData={userData} />
            ) : userData?.user_type === 'doctor' ? (
                <DoctorDashboard userData={userData} />
            ) : userData?.user_type === 'admin' ? (
                <AdminDashboard userData={userData} />
            ) : (
                <div className="flex-1 p-6 text-red-500 text-center">Unknown user type</div>
            )}
        </div>
    );
}