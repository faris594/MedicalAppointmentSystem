import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import PatientSidebar from '../../components/sidebar/PatientSidebar';

interface DoctorUser {
    id: number;
    name: string;
    email: string;
    phone: string;
    dob: string;
    city: string;
    user_type: string;
}

interface DoctorData {
    id: number;
    specialty: string;
    description: string;
    user: DoctorUser;
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

interface DoctorSchedule {
    availableDays: string[];
    startHour: string;
    startMinute: string;
    startPeriod: string;
    endHour: string;
    endMinute: string;
    endPeriod: string;
}

export default function DoctorProfile() {
    const router = useRouter();
    const { id } = router.query;

    const [doctor, setDoctor] = useState<DoctorData | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [schedule, setSchedule] = useState<DoctorSchedule | null>(null);
    const [loading, setLoading] = useState(true);
    const [scheduleLoading, setScheduleLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bookingMessage, setBookingMessage] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');


    // Ensure router is ready before reading query param
    useEffect(() => {
        if (!router.isReady) return;

        const doctorId = router.query.id;
        console.log('Doctor ID from query:', doctorId);

        if (!doctorId || Array.isArray(doctorId)) {
            setError('Invalid doctor ID');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No authentication token found');

                const userResponse = await axios.get('http://localhost:8080/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('User data:', userResponse.data); // Debug patient data
                setUserData(userResponse.data);

                const doctorResponse = await axios.get(`http://localhost:8080/api/auth/doctors/${doctorId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Doctor data:', doctorResponse.data); // Debug doctor data
                setDoctor(doctorResponse.data);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router.isReady]);

    // Fetch schedule once doctor is loaded
    useEffect(() => {
        if (!doctor) return;

        const fetchSchedule = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No authentication token found');

                const response = await axios.get(`http://localhost:8080/api/auth/schedule/doctor/${doctor.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setSchedule(response.data);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    // Gracefully handle doctors with no schedule
                    console.warn('Doctor has no schedule set.');
                    setSchedule(null);
                } else {
                    console.error('Failed to fetch schedule:', err);
                    setSchedule(null); // fallback to null
                }
            } finally {
                setScheduleLoading(false);
            }
        };

        fetchSchedule();
    }, [doctor]);

    const handleBookAppointment = async () => {
        if (!appointmentDate || !appointmentTime) {
            setBookingMessage('Please select both date and time.');
            return;
        }

        if (!schedule) {
            setBookingMessage('This doctor has no available schedule set. Please choose another doctor or check back later.');
            return;
        }

        const now = new Date();
        const selectedDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
        if (selectedDateTime <= now) {
            setBookingMessage('Cannot book appointments in the past.');
            return;
        }

        // Client-side validation against schedule days and hours
        const selectedDay = new Date(appointmentDate).toLocaleString('en-US', { weekday: 'long' });
        if (!schedule.availableDays.includes(selectedDay)) {
            setBookingMessage(`Doctor is not available on ${selectedDay}.`);
            return;
        }

        const [selHour, selMinute] = appointmentTime.split(':').map(Number);
        const start24 = convertTo24Hour(schedule.startHour, schedule.startMinute, schedule.startPeriod);
        const end24 = convertTo24Hour(schedule.endHour, schedule.endMinute, schedule.endPeriod);
        const selectedMinutes = selHour * 60 + selMinute;
        if (selectedMinutes < start24 || selectedMinutes >= end24) {
            setBookingMessage(`Selected time is outside the doctor’s working hours.`);
            return;
        }

        setBookingLoading(true);
        setBookingMessage('');

        try {
            const token = localStorage.getItem('token');
            if (!token || !userData || !doctor) throw new Error('Missing user or doctor info');

            // Step 1: Fetch existing appointments for this doctor and date
            const response = await axios.get(`http://localhost:8080/api/auth/appointments`, {
                params: { doctorId: doctor.id, date: appointmentDate },
                headers: { Authorization: `Bearer ${token}` }
            });
            const existingAppointments = response.data; // assume array of appointments with time field

            // Step 2: Check for overlap (assuming 1-hour slots)
            const selectedStart = new Date(`${appointmentDate}T${appointmentTime}:00`).getTime();
            const selectedEnd = selectedStart + 60 * 60 * 1000;

            const overlap = existingAppointments.some(appt => {
                const apptStart = new Date(`${appt.date}T${appt.time}:00`).getTime();
                const apptEnd = apptStart + 60 * 60 * 1000;
                return selectedStart < apptEnd && selectedEnd > apptStart;
            });

            if (overlap) {
                setBookingMessage('Selected time overlaps with an existing appointment. Please choose another time.');
                setBookingLoading(false);
                return;
            }

            // Step 3: Proceed to book since no overlap
            await axios.post(
                'http://localhost:8080/api/auth/appointment',
                {
                    doctorId: doctor.id,
                    patientId: userData.id,
                    date: appointmentDate,
                    time: appointmentTime,
                    status: 'pending',
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setConfirmationMessage(`✅ Appointment booked for ${appointmentDate} at ${appointmentTime}`);
            setAppointmentDate('');
            setAppointmentTime('');
            setTimeout(() => setConfirmationMessage(''), 5000);
        } catch (err) {
            console.error('Booking error:', err);
            if (axios.isAxiosError(err)) {
                const serverMessage = err.response?.data?.message;
                if (serverMessage) {
                    setBookingMessage(serverMessage); // show detailed message like overlap
                } else {
                    setBookingMessage('Booking failed. Please check the inputs and try again.');
                }
            }
        } finally {
            setBookingLoading(false);
        }
    };

// Helper to convert to minutes since midnight (24h time)
    function convertTo24Hour(hourStr: string, minuteStr: string, period: string): number {
        let hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);
        if (period.toLowerCase() === 'pm' && hour !== 12) hour += 12;
        if (period.toLowerCase() === 'am' && hour === 12) hour = 0;
        return hour * 60 + minute;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <PatientSidebar email={userData?.email} />

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-3xl mx-auto">
                    {loading ? (
                        <p className="text-center mt-10 text-gray-600">Loading...</p>
                    ) : error ? (
                        <p className="text-center mt-10 text-red-600">{error}</p>
                    ) : doctor ? (
                        <>
                            <h1 className="text-4xl font-bold text-teal-700 mb-8">{doctor.user.name}</h1>
                            <div className="bg-white text-black rounded-2xl shadow-md p-8 space-y-4">
                                <p><strong>Email:</strong> {doctor.user.email}</p>
                                <p><strong>Phone:</strong> {doctor.user.phone}</p>
                                <p><strong>Date of Birth:</strong> {doctor.user.dob}</p>
                                <p><strong>City:</strong> {doctor.user.city}</p>
                                <p><strong>Specialty:</strong> {doctor.specialty}</p>
                                <p><strong>Description:</strong> {doctor.description}</p>
                            </div>

                            <div className="mt-8 bg-white rounded-2xl shadow-md p-8 space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800">Available Appointment Slots</h2>
                                {scheduleLoading ? (
                                    <p className="text-gray-600">Loading schedule...</p>
                                ) : schedule ? (
                                    <div className="text-gray-700">
                                        <p><strong>Available Days:</strong> {schedule.availableDays.join(', ')}</p>
                                        <p>
                                            <strong>Time:</strong> {schedule.startHour}:{schedule.startMinute} {schedule.startPeriod} to {schedule.endHour}:{schedule.endMinute} {schedule.endPeriod}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-600 italic">No schedule available.</p>
                                )}
                            </div>

                            <div className="mt-8 bg-white rounded-2xl shadow-md p-8 space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800">Book Appointment</h2>
                                <input
                                    type="date"
                                    value={appointmentDate}
                                    onChange={(e) => setAppointmentDate(e.target.value)}
                                    className="block w-full px-3 py-2 mb-3 border rounded-lg text-black"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <input
                                    type="time"
                                    value={appointmentTime}
                                    onChange={(e) => setAppointmentTime(e.target.value)}
                                    className="block w-full px-3 py-2 border rounded-lg text-black"
                                />
                                {bookingMessage && <p className="text-red-600">{bookingMessage}</p>}
                                {confirmationMessage && <p className="text-green-600">{confirmationMessage}</p>}
                                <button
                                    onClick={handleBookAppointment}
                                    className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg"
                                    disabled={bookingLoading}
                                >
                                    {bookingLoading ? 'Booking...' : 'Book Appointment'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-center mt-10 text-red-600">Doctor not found.</p>
                    )}
                </div>
            </main>
        </div>
    );
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <a
            href={href}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-teal-500 text-white"
        >
            <span>{icon}</span>
            <span>{label}</span>
        </a>
    );
}
