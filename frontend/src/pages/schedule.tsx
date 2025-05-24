'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Schedule from '@/components/Schedule';

export default function SchedulePage() {
    const router = useRouter();
    const [userData, setUserData] = useState<{
        id?: number;
        email?: string;
        user_type?: 'doctor';
        name?: string;
        phone?: string;
        dob?: string;
        city?: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok && data.user_type === 'doctor') {
                    setUserData(data);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    if (!userData) return null;

    return <Schedule userData={userData} />;
}