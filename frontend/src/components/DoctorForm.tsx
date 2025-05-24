'use client';
import { useState, FormEvent } from 'react';

interface DoctorFormProps {
    onSubmit: (data: { name: string; email: string; phone: string; specialty: string }) => void;
}

export default function DoctorForm({ onSubmit }: DoctorFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specialty: '',
    });

    const [errors, setErrors] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const { name, email, phone, specialty } = formData;
        if (!name || !email || !phone || !specialty) return 'All fields are required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Invalid email format.';
        if (!/^\d{7,15}$/.test(phone)) return 'Phone number should be numeric and 7–15 digits.';
        return null;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setErrors(validationError);
            return;
        }
        setErrors(null);
        onSubmit(formData);
        setFormData({ name: '', email: '', phone: '', specialty: '' });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Doctor creation form">
                {errors && (
                    <div className="text-red-600 text-sm text-center">
                        {errors}
                    </div>
                )}

                {/* Input Fields */}
                {[
                    { label: 'Full Name', name: 'name', type: 'text' },
                    { label: 'Email Address', name: 'email', type: 'email' },
                    { label: 'Phone Number', name: 'phone', type: 'tel' },
                ].map(({ label, name, type }) => (
                    <div key={name}>
                        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
                        <input
                            type={type}
                            id={name}
                            name={name}
                            value={formData[name as keyof typeof formData]}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        />
                    </div>
                ))}

                {/* Specialty */}
                <div>
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">Specialty</label>
                    <select
                        id="specialty"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    >
                        <option value="">Select a specialty</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="General Practice">General Practice</option>
                    </select>
                </div>

                {/* Submit */}
                <div className="text-center">
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        Create Doctor
                    </button>
                </div>
            </form>
        </div>
    );
}
