import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import DoctorSidebar from '../components/sidebar/DoctorSidebar';

// Interfaces for type safety
interface UserData {
    id: number;
    email: string;
    user_type: 'doctor';
    name?: string;
    phone?: string;
    dob?: string;
    city?: string;
}


interface Appointment {
    id: number;
    doctorId: number;
    patientId: number;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'canceled';
    patient: { name?: string; phone?: string; email?: string };
}

interface ScheduleProps {
    userData: UserData | null;
}

export default function Schedule({ userData }: ScheduleProps) {
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [startHour, setStartHour] = useState('08');
    const [startMinute, setStartMinute] = useState('00');
    const [startPeriod, setStartPeriod] = useState('AM');
    const [endHour, setEndHour] = useState('05');
    const [endMinute, setEndMinute] = useState('00');
    const [endPeriod, setEndPeriod] = useState('PM');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const handleDayChange = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    // Validate schedule time (end time must be after start time)
    const validateTime = () => {
        const startTime = new Date(`2023-01-01 ${startHour}:${startMinute} ${startPeriod}`);
        const endTime = new Date(`2023-01-01 ${endHour}:${endMinute} ${endPeriod}`);
        return endTime > startTime;
    };

    // Check if an appointment is within the doctor's schedule
    const isAppointmentWithinSchedule = (appointment: Appointment) => {
        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(appointment.date) || isNaN(new Date(appointment.date).getTime())) {
            return { valid: false, message: 'Invalid date format' };
        }

        // Validate time format (HH:mm)
        if (!/^\d{2}:\d{2}$/.test(appointment.time)) {
            return { valid: false, message: 'Invalid time format' };
        }

        // Parse appointment date to get the day of the week
        const appointmentDate = new Date(appointment.date);
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const appointmentDay = daysOfWeek[appointmentDate.getDay()];

        // Check if the day is available
        if (!selectedDays.includes(appointmentDay)) {
            return { valid: false, message: `Scheduled on unavailable day: ${appointmentDay}` };
        }

        // Parse appointment time and schedule times
        const [apptHour, apptMinute] = appointment.time.split(':').map(Number);
        if (apptHour > 23 || apptMinute > 59) {
            return { valid: false, message: 'Invalid time' };
        }

        let scheduleStartHour = parseInt(startHour);
        if (startPeriod === 'PM' && scheduleStartHour !== 12) scheduleStartHour += 12;
        if (startPeriod === 'AM' && scheduleStartHour === 12) scheduleStartHour = 0;
        let scheduleEndHour = parseInt(endHour);
        if (endPeriod === 'PM' && scheduleEndHour !== 12) scheduleEndHour += 12;
        if (endPeriod === 'AM' && scheduleEndHour === 12) scheduleEndHour = 0;

        const scheduleStart = new Date();
        scheduleStart.setHours(scheduleStartHour, parseInt(startMinute), 0, 0);
        const scheduleEnd = new Date();
        scheduleEnd.setHours(scheduleEndHour, parseInt(endMinute), 0, 0);
        const apptTime = new Date();
        apptTime.setHours(apptHour, apptMinute, 0, 0);

        // Check if time is within schedule
        if (apptTime < scheduleStart || apptTime > scheduleEnd) {
            return {
                valid: false,
                message: `Scheduled outside available hours: ${appointment.time} (Available: ${startHour}:${startMinute} ${startPeriod} - ${endHour}:${endMinute} ${endPeriod})`,
            };
        }

        return { valid: true };
    };

    // Fetch schedule and appointments
    useEffect(() => {
        const fetchDoctorData = async () => {
            if (!userData?.id) return;
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No authentication token found');

                // Step 1: Fetch profile to get doctorId
                const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const profileData = await profileRes.json();
                const doctorId = profileData.doctor?.id;

                if (!doctorId) throw new Error('Doctor ID not found in profile');

                // Step 2: Fetch schedule using doctorId
                const scheduleRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schedule/doctor/${doctorId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const scheduleData = await scheduleRes.json();

                if (!scheduleRes.ok) {
                    if (scheduleRes.status === 404) {
                        setSelectedDays([]);
                        setStartHour('08');
                        setStartMinute('00');
                        setStartPeriod('AM');
                        setEndHour('05');
                        setEndMinute('00');
                        setEndPeriod('PM');
                    } else {
                        throw new Error(scheduleData.message || 'Error fetching schedule');
                    }
                } else {
                    setSelectedDays(scheduleData.availableDays || []);
                    setStartHour(scheduleData.startHour || '08');
                    setStartMinute(scheduleData.startMinute || '00');
                    setStartPeriod(scheduleData.startPeriod || 'AM');
                    setEndHour(scheduleData.endHour || '05');
                    setEndMinute(scheduleData.endMinute || '00');
                    setEndPeriod(scheduleData.endPeriod || 'PM');
                }

                // Step 3: Fetch appointments using doctorId
                const appointmentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/doctor/${doctorId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const appointmentsData = await appointmentsRes.json();
                if (!appointmentsRes.ok) {
                    throw new Error(appointmentsData.message || 'Error fetching appointments');
                }
                setAppointments(appointmentsData || []);
            } catch (error) {
                console.error('Doctor data fetch failed:', error);
                toast.error(error.message || 'Failed to load doctor data');
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorData();
    }, [userData?.id]);


    // Save schedule
    const handleSave = async () => {
        if (!userData?.id) return;
        if (!validateTime()) {
            toast.error('End time must be after start time');
            return;
        }
        if (selectedDays.length === 0) {
            toast.error('Please select at least one day');
            return;
        }
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    doctorId: userData.id,
                    availableDays: selectedDays,
                    startHour,
                    startMinute,
                    startPeriod,
                    endHour,
                    endMinute,
                    endPeriod,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to save schedule');
            setSelectedDays(data.availableDays || []);
            setStartHour(data.startHour || '08');
            setStartMinute(data.startMinute || '00');
            setStartPeriod(data.startPeriod || 'AM');
            setEndHour(data.endHour || '05');
            setEndMinute(data.endMinute || '00');
            setEndPeriod(data.endPeriod || 'PM');
            toast.success('Schedule saved successfully!');
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save schedule');
        } finally {
            setLoading(false);
        }
    };

    // Cancel appointment
    const handleCancelAppointment = async (appointmentId: number) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token is missing.');
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointment/${appointmentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            const isJson = response.headers.get("content-type")?.includes("application/json");
            const data = isJson ? await response.json() : {};

            if (!response.ok) {
                console.error('Delete failed:', {
                    status: response.status,
                    data,
                });
                throw new Error(data.message || 'Failed to cancel appointment');
            }

            setAppointments((prev) => prev.filter((appt) => appt.id !== appointmentId));
            toast.success('Appointment cancelled successfully!');
        } catch (error) {
            console.error('Cancel failed:', error);
            toast.error(error.message || 'Failed to cancel appointment');
        } finally {
            setLoading(false);
        }
    };

    // Update appointment status
    const handleStatusChange = async (appointmentId: number, newStatus: 'pending' | 'confirmed' | 'completed' | 'canceled') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token is missing.');
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointment/${appointmentId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const isJson = response.headers.get("content-type")?.includes("application/json");
            const data = isJson ? await response.json() : {};

            if (!response.ok) {
                console.error('Status update failed:', {
                    status: response.status,
                    data,
                });
                throw new Error(data.message || 'Failed to update appointment status');
            }

            setAppointments((prev) =>
                prev.map((appt) =>
                    appt.id === appointmentId ? { ...appt, status: newStatus } : appt
                )
            );
            toast.success('Appointment status updated successfully!');
        } catch (error) {
            console.error('Status update failed:', error);
            toast.error(error.message || 'Failed to update appointment status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <ToastContainer position="top-right" autoClose={2000} />

            <DoctorSidebar userData={userData} />


            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto bg-gray-50 relative">
                <button
                    className="md:hidden mb-4 p-2 bg-teal-600 text-white rounded"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open sidebar"
                >
                    ☰
                </button>

                <div className="max-w-6xl mx-auto">
                    <header className="w-full bg-gradient-to-br from-gray-800 to-teal-500 px-6 py-4 mb-8 flex items-center rounded-b-lg shadow-md">
                        <img src="/images/logo.svg" alt="Health Care Logo" className="w-12 h-12 mr-4" />
                        <h1 className="text-3xl font-semibold text-teal-100">Doctor Schedule</h1>
                    </header>

                    {/* Schedule Form */}
                    <div className="bg-gray-300 p-6 rounded-xl shadow-md mb-8">
                        <h2 className="text-xl font-semibold text-teal-700 mb-4">Set Your Availability</h2>
                        {loading && (
                            <div className="flex justify-center mb-4">
                                <FaSpinner className="animate-spin text-teal-600 text-2xl" />
                            </div>
                        )}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSave();
                            }}
                            className="space-y-6"
                            aria-label="Doctor availability form"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-2">Select Days</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {days.map((day) => (
                                            <label key={day} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDays.includes(day)}
                                                    onChange={() => handleDayChange(day)}
                                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                                    aria-label={`Select ${day}`}
                                                />
                                                <span className="text-lg text-gray-700">{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-2">Start Time</label>
                                    <div className="flex space-x-2 text-black">
                                        <select
                                            className="p-2 border rounded focus:ring-teal-500 focus:border-teal-500"
                                            value={startHour}
                                            onChange={(e) => setStartHour(e.target.value)}
                                            aria-label="Start hour"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                                                <option key={hour} value={hour < 10 ? `0${hour}` : `${hour}`}>
                                                    {hour}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            className="p-2 border rounded focus:ring-teal-500 focus:border-teal-500"
                                            value={startMinute}
                                            onChange={(e) => setStartMinute(e.target.value)}
                                            aria-label="Start minute"
                                        >
                                            {['00', '15', '30', '45'].map((minute) => (
                                                <option key={minute} value={minute}>{minute}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="p-2 border rounded focus:ring-teal-500 focus:border-teal-500"
                                            value={startPeriod}
                                            onChange={(e) => setStartPeriod(e.target.value)}
                                            aria-label="Start period"
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-2">End Time</label>
                                    <div className="flex space-x-2 text-black">
                                        <select
                                            className="p-2 border rounded focus:ring-teal-500 focus:border-teal-500"
                                            value={endHour}
                                            onChange={(e) => setEndHour(e.target.value)}
                                            aria-label="End hour"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                                                <option key={hour} value={hour < 10 ? `0${hour}` : `${hour}`}>
                                                    {hour}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            className="p-2 border rounded focus:ring-teal-500 focus:border-teal-500"
                                            value={endMinute}
                                            onChange={(e) => setEndMinute(e.target.value)}
                                            aria-label="End minute"
                                        >
                                            {['00', '15', '30', '45'].map((minute) => (
                                                <option key={minute} value={minute}>{minute}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="p-2 border rounded focus:ring-teal-500 focus:border-teal-500"
                                            value={endPeriod}
                                            onChange={(e) => setEndPeriod(e.target.value)}
                                            aria-label="End period"
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition disabled:opacity-50"
                                    aria-label="Save schedule changes"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Appointment Table */}
                    <div className="bg-gray-300 p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold text-teal-700 mb-4">Upcoming Appointments</h2>
                        {loading && (
                            <div className="flex justify-center mb-4">
                                <FaSpinner className="animate-spin text-teal-600 text-2xl" />
                            </div>
                        )}
                        <div className="overflow-x-auto text-black">
                            <table className="w-full border-collapse">
                                <thead>
                                <tr className="bg-teal-500 text-white">
                                    <th className="p-3 border text-left">Patient Name</th>
                                    <th className="p-3 border text-left">Phone</th>
                                    <th className="p-3 border text-left">Email</th>
                                    <th className="p-3 border text-left">Date</th>
                                    <th className="p-3 border text-left">Time</th>
                                    <th className="p-3 border text-left">Status</th>
                                    <th className="p-3 border text-left">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {appointments.length === 0 ? (
                                    <tr className="hover:bg-gray-100">
                                        <td colSpan={7} className="p-3 border text-center">
                                            No appointments found.
                                        </td>
                                    </tr>
                                ) : (
                                    appointments.map((appointment) => {
                                        const scheduleCheck = isAppointmentWithinSchedule(appointment);
                                        return (
                                            <tr
                                                key={appointment.id}
                                                className={`hover:bg-gray-100 ${!scheduleCheck.valid ? 'bg-red-100' : ''}`}
                                            >
                                                <td className="p-3 border">
                                                    {appointment.patient?.name || '—'}
                                                    {!scheduleCheck.valid && (
                                                        <span
                                                            className="ml-2 text-red-600"
                                                            title={scheduleCheck.message}
                                                            aria-label={scheduleCheck.message}
                                                        >
                                                            <FaExclamationTriangle />
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 border">{appointment.patient?.phone || '—'}</td>
                                                <td className="p-3 border">{appointment.patient?.email || '—'}</td>
                                                <td className="p-3 border">{appointment.date}</td>
                                                <td className="p-3 border">{appointment.time}</td>
                                                <td className="p-3 border">
                                                    <select
                                                        value={appointment.status}
                                                        onChange={(e) => handleStatusChange(appointment.id, e.target.value as 'pending' | 'confirmed' | 'completed' | 'canceled')}
                                                        className="p-1 border rounded focus:ring-teal-500 focus:border-teal-500"
                                                        disabled={loading}
                                                        aria-label={`Change status for ${appointment.patient?.name || 'patient'}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="canceled">Canceled</option>
                                                    </select>
                                                </td>
                                                <td className="p-3 border">
                                                    <button
                                                        onClick={() => handleCancelAppointment(appointment.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        disabled={loading}
                                                        aria-label={`Cancel appointment for ${appointment.patient?.name || 'patient'}`}
                                                    >
                                                        Cancel
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                </tbody>
                            </table>
                        </div>
                        {/* Responsive Card Layout for Mobile */}
                        <div className="md:hidden space-y-4 mt-4">
                            {appointments.length === 0 ? (
                                <p className="text-center text-gray-700">No appointments found.</p>
                            ) : (
                                appointments.map((appointment) => {
                                    const scheduleCheck = isAppointmentWithinSchedule(appointment);
                                    return (
                                        <div
                                            key={appointment.id}
                                            className={`bg-white p-4 rounded-lg shadow ${!scheduleCheck.valid ? 'border-l-4 border-red-600' : ''}`}
                                        >
                                            <p>
                                                <strong>Name:</strong> {appointment.patient?.name || '—'}
                                                {!scheduleCheck.valid && (
                                                    <span
                                                        className="ml-2 text-red-600"
                                                        title={scheduleCheck.message}
                                                        aria-label={scheduleCheck.message}
                                                    >
                                                        <FaExclamationTriangle />
                                                    </span>
                                                )}
                                            </p>
                                            <p><strong>Phone:</strong> {appointment.patient?.phone || '—'}</p>
                                            <p><strong>Email:</strong> {appointment.patient?.email || '—'}</p>
                                            <p><strong>Date:</strong> {appointment.date}</p>
                                            <p><strong>Time:</strong> {appointment.time}</p>
                                            <p>
                                                <strong>Status:</strong>
                                                <select
                                                    value={appointment.status}
                                                    onChange={(e) => handleStatusChange(appointment.id, e.target.value as 'pending' | 'confirmed' | 'completed' | 'canceled')}
                                                    className="ml-2 p-1 border rounded focus:ring-teal-500 focus:border-teal-500"
                                                    disabled={loading}
                                                    aria-label={`Change status for ${appointment.patient?.name || 'patient'}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="canceled">Canceled</option>
                                                </select>
                                            </p>
                                            <button
                                                onClick={() => handleCancelAppointment(appointment.id)}
                                                className="text-red-600 hover:text-red-800 mt-2"
                                                disabled={loading}
                                                aria-label={`Cancel appointment for ${appointment.patient?.name || 'patient'}`}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
