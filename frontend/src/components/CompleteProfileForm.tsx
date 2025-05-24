'use client';
import { useState } from 'react';

type CompleteProfileFormProps = {
    onComplete: (data: { phone: string; dob: string; city: string }) => void;
};

export default function CompleteProfileForm({ onComplete }: CompleteProfileFormProps) {
    const [formData, setFormData] = useState({
        phone: '',
        dob: '',
        city: '',
    });

    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!formData.phone || !formData.dob || !formData.city) {
            setError('Please fill all fields.');
            return;
        }

        try {
            await onComplete(formData);
        } catch (err) {
            setError('Failed to update profile. Try again.');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-teal-600 to-teal-900">
            <div className="bg-gray-200 rounded-lg shadow-xl p-8 max-w-md w-full">
                <h2 className="text-3xl font-bold text-teal-500 mb-6 text-center">Complete Your Profile</h2>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1" htmlFor="phone">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="text-black w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-4 focus:ring-teal-500"
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1" htmlFor="dob">Date of Birth</label>
                        <input
                            type="date"
                            id="dob"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="text-black w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-4 focus:ring-teal-500"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-1" htmlFor="city">City</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="text-black w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-4 focus:ring-teal-500"
                            placeholder="Enter your city"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-700"
                    >
                        Save Profile
                    </button>
                </form>
            </div>
        </div>
    );
}
