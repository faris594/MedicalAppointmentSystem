'use client'
import { useState } from "react";

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        dob: "",
        password: "",
        confirmPassword: "",
        city: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    dob: formData.dob,
                    password: formData.password,
                    city: formData.city,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Registration successful! ✅");
            } else {
                alert(data.message || "Registration failed ❌");
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("Something went wrong!");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-500 to-teal-600">
            <div className="bg-gray-200 justify-center rounded-lg shadow-xl p-8 max-w-4xl w-full flex">
                <div className="w-1/2 p-6">
                    {/* Logo */}
                    <div className="flex items-center mb-6">
                        <img src="/images/logo.svg" alt="Health Care Logo" className="w-40 h-40 mr-4" />
                        <h2 className="text-3xl font-bold text-teal-500">Health Care</h2>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Name</label>
                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="text-black w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-4 focus:ring-teal-500"
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="text-black w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-4 focus:ring-teal-500"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Phone Number</label>
                            <input
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="text-black w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-4 focus:ring-teal-500"
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Date of Birth</label>
                            <input
                                name="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                                className="text-black w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-4 focus:ring-teal-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">City</label>
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="text-black w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-4 focus:ring-teal-500"
                                required
                            >
                                <option value="">Select your city</option>
                                <option value="Amman">Amman</option>
                                <option value="Irbid">Irbid</option>
                                <option value="Zarqa">Zarqa</option>
                                <option value="Madaba">Madaba</option>
                                <option value="Aqaba">Aqaba</option>
                                <option value="Salt">Salt</option>
                                <option value="Jerash">Jerash</option>
                                <option value="Mafraq">Mafraq</option>
                                <option value="Tafilah">Tafilah</option>
                                <option value="Karak">Karak</option>
                                <option value="Ma'an">Ma'an</option>
                                <option value="Ajloun">Ajloun</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="text-black w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-4 focus:ring-teal-500"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700">Confirm Password</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="text-black w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-4 focus:ring-teal-500"
                                placeholder="Confirm your password"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-700">
                            Register
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="text-indigo-500 hover:text-indigo-700">Login</a>
                    </p>
                </div>
                {/* Optional Right Side Image/Pattern
                <div className="w-1/2 bg-indigo-200 flex items-center justify-center rounded-r-lg">
                    <img src="/images/design1.jpg" alt="Pattern" className="w-full h-full object-cover rounded-r-lg" />
                </div>
                */}
            </div>
        </div>
    );
}
