import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import LogoutButton from '../../components/dashboard/LogoutButton';
import AdminHeader from '../../components/sidebar/AdminHeader'; // Adjust path as needed

interface CreateDoctorProps {
    userData?: {
        id: number;
        email: string;
        user_type: 'admin';
        name?: string;
        phone?: string;
        dob?: string;
        city?: string;
    } | null;
}

export default function CreateDoctor({ userData = null }: CreateDoctorProps) {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dob: '',
        password: '',
        confirmPassword: '',
        specialty: '',
        city: '',
        description: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    dob: formData.dob,
                    password: formData.password,
                    city: formData.city,
                    user_type: "doctor",
                    specialty: formData.specialty,
                    description: formData.description,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to register doctor");
            }

            const result = await response.json();
            alert("Doctor registered successfully!");
            router.push("/dashboard"); // or any success page

        } catch (error: any) {
            console.error("Registration error:", error.message);
            alert(`Error: ${error.message}`);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col w-full">
            {/* Header */}
            <AdminHeader userData={userData} />

            {/* Main Content - Create Doctor Form */}
            <main className="flex-1 py-10 px-6 flex justify-center">
                <div className="w-full max-w-3xl bg-white p-8 rounded shadow space-y-6">
                    <h2 className="text-3xl font-semibold text-teal-700 mb-4">Create Doctor</h2>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block font-medium text-black mb-1" htmlFor="name">Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-black mb-1" htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-black mb-1" htmlFor="phone">Phone number</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-black mb-1" htmlFor="dob">Date of Birth</label>
                            <input
                                id="dob"
                                name="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-black mb-1" htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-black mb-1" htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-black mb-1" htmlFor="specialty">Specialty</label>
                            <input
                                id="specialty"
                                name="specialty"
                                type="text"
                                value={formData.specialty}
                                onChange={handleChange}
                                required
                                placeholder="Cardiology"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-black mb-1" htmlFor="city">City</label>
                            <input
                                id="city"
                                name="city"
                                type="text"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-medium text-black mb-1" htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}