import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FaHome, FaUserMd, FaQuestionCircle, FaLifeRing, FaUserCircle } from 'react-icons/fa';
import UserInfo from '../components/dashboard/UserInfo';
import LogoutButton from '../components/dashboard/LogoutButton';
import axios from 'axios';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
}

interface UserData {
    id: number;
    email: string;
    user_type: 'patient';
    name?: string;
    phone?: string;
    dob?: string;
    city?: string;
}

export default function DoctorsPage() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No authentication token found');

                const userResponse = await axios.get('http://localhost:8080/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserData(userResponse.data);

                const doctorsResponse = await axios.get('http://localhost:8080/api/auth/doctors', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDoctors(doctorsResponse.data);
            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-gray-900 to-teal-600 p-6 shadow-xl text-white flex flex-col">
                <div className="flex items-center mb-10">
                    <img src="/images/logo.svg" alt="Logo" className="w-10 h-10 mr-3" />
                    <h1 className="text-2xl font-bold tracking-wide">HealthCare</h1>
                </div>

                {userData?.email && (
                    <div className="mb-8 text-sm text-gray-200">
                        <p>Welcome,</p>
                        <p className="font-semibold">{userData.email}</p>
                    </div>
                )}

                <nav className="flex-1 space-y-4">
                    <SidebarLink href="/dashboard" icon={<FaHome />} label="Dashboard" />
                    <SidebarLink href="/doctors" icon={<FaUserMd />} label="Doctors" />
                    <SidebarLink href="/profile" icon={<FaUserMd />} label="Profile" />
                    <SidebarLink href="/faq" icon={<FaQuestionCircle />} label="FAQ" />
                    <SidebarLink href="/support" icon={<FaLifeRing />} label="Support" />
                </nav>

                <div className="mt-auto">
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold text-teal-700 mb-8">Available Doctors</h1>

                    {loading && <p className="text-gray-600 text-lg">Loading doctors...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && doctors.length === 0 && (
                        <p className="text-gray-600 text-lg">No doctors available at the moment.</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {doctors.map((doctor) => (
                            <a
                                key={doctor.id}
                                href={`/doctors/${doctor.id}`}
                                className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition duration-300 border hover:border-teal-400 cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    router.push(`/doctors/${doctor.id}`);
                                }}
                            >
                                <div className="flex justify-center mb-4">
                                    <img
                                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(doctor.email + 5)}`}
                                        alt={doctor.name}
                                        className="w-20 h-20 rounded-full object-cover bg-teal-100"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">{doctor.name}</h3>
                                <p className="text-teal-600 mt-1">{doctor.specialty}</p>
                            </a>
                        ))}

                    </div>
                </div>
            </main>
        </div>
    );
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <a
            href={href}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-teal-500 transition-colors duration-200 text-white text-sm"
        >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
        </a>
    );
}