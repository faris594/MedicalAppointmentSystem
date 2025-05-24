'use client';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt } from 'react-icons/fa'; // Import logout icon

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center p-3 rounded-lg text-white hover:bg-teal-500 transition-colors duration-200 text-left cursor-pointer"
        >
            <FaSignOutAlt className="mr-3 text-xl" />
            <span>Logout</span>
        </button>
    );
}
