import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { User } from '../models/User';
import { Doctor } from '../models/Doctor';
import { DoctorSchedule } from '../models/DoctorSchedule';

// Helper function to validate appointment against doctor's schedule
import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { DoctorSchedule } from '../models/DoctorSchedule';

import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { DoctorSchedule } from '../models/DoctorSchedule';

const validateAppointmentAgainstSchedule = async (
    doctorId: number,
    date: string,
    time: string
): Promise<{ valid: boolean; message?: string }> => {
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) {
        return { valid: false, message: 'Invalid date format, expected YYYY-MM-DD' };
    }

    // Validate time format (HH:mm)
    if (!/^\d{2}:\d{2}$/.test(time)) {
        return { valid: false, message: 'Invalid time format, expected HH:mm' };
    }

    const schedule = await DoctorSchedule.findOne({ where: { doctorId } });
    if (!schedule) {
        return { valid: false, message: 'Doctor has no schedule defined' };
    }

    // Parse appointment date to get the day of the week
    const appointmentDate = new Date(date);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const appointmentDay = daysOfWeek[appointmentDate.getDay()];

    // Check if the appointment day is in availableDays
    if (!schedule.availableDays.includes(appointmentDay)) {
        return { valid: false, message: `Doctor is not available on ${appointmentDay}` };
    }

    // Parse appointment time and schedule times
    const [apptHour, apptMinute] = time.split(':').map(Number);
    if (apptHour > 23 || apptMinute > 59) {
        return { valid: false, message: 'Invalid time, hours must be 0-23 and minutes 0-59' };
    }

    const scheduleStart = new Date();
    const scheduleEnd = new Date();
    const apptTime = new Date();

    // Convert schedule times to 24-hour format
    let startHour = parseInt(schedule.startHour);
    if (schedule.startPeriod === 'PM' && startHour !== 12) startHour += 12;
    if (schedule.startPeriod === 'AM' && startHour === 12) startHour = 0;
    let endHour = parseInt(schedule.endHour);
    if (schedule.endPeriod === 'PM' && endHour !== 12) endHour += 12;
    if (schedule.endPeriod === 'AM' && endHour === 12) endHour = 0;

    scheduleStart.setHours(startHour, parseInt(schedule.startMinute), 0, 0);
    scheduleEnd.setHours(endHour, parseInt(schedule.endMinute), 0, 0);
    apptTime.setHours(apptHour, apptMinute, 0, 0);

    // Check if appointment time is within schedule
    if (apptTime < scheduleStart || apptTime >= scheduleEnd) { // Changed > to >= to exclude end boundary
        return {
            valid: false,
            message: `Appointment time ${time} is outside doctor's schedule (${schedule.startHour}:${schedule.startMinute} ${schedule.startPeriod} - ${schedule.endHour}:${schedule.endMinute} ${schedule.endPeriod})`,
        };
    }

    // Check for overlapping appointments
    const apptStart = new Date(`${date}T${time}:00`);
    const apptEnd = new Date(apptStart.getTime() + 60 * 60 * 1000); // 1-hour duration

    const overlappingAppointments = await Appointment.findAll({
        where: {
            doctorId,
            date,
            status: ['pending', 'confirmed'], // Only active appointments
        },
    });

    for (const appt of overlappingAppointments) {
        const existingStart = new Date(`${appt.date}T${appt.time}:00`);
        const existingEnd = new Date(existingStart.getTime() + 60 * 60 * 1000); // 1-hour duration
        if (apptStart < existingEnd && apptEnd > existingStart) {
            return {
                valid: false,
                message: `Time slot ${time} on ${date} overlaps with an existing appointment`,
            };
        }
    }

    return { valid: true };
};

export const getAppointments = async (req: Request, res: Response) => {
    try {
        const appointments = await Appointment.findAll({
            include: [
                { model: User, as: 'patient', attributes: ['name'] },
                {
                    model: Doctor,
                    as: 'doctor',
                    include: [{ model: User, as: 'user', attributes: ['name'] }],
                },
            ],
        });

        const formattedAppointments = appointments.map((appointment) => ({
            id: appointment.id,
            doctorName: appointment.doctor?.user?.name || 'Unknown',
            patientName: appointment.patient?.name || 'Unknown',
            date: appointment.date,
            time: appointment.time,
            state: appointment.status,
        }));

        res.status(200).json(formattedAppointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const createAppointment = async (req: Request, res: Response) => {
    try {
        const { doctorId, patientId, date, time, status = 'pending' } = req.body;

        // Validate required fields
        if (!doctorId || !patientId || !date || !time) {
            return res.status(400).json({ message: 'Missing required fields: doctorId, patientId, date, time' });
        }

        // Validate status
        if (status && !['pending', 'confirmed', 'completed', 'canceled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status, must be pending, confirmed, completed, or canceled' });
        }

        // Validate appointment against schedule and overlaps
        const validation = await validateAppointmentAgainstSchedule(doctorId, date, time);
        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        const appointment = await Appointment.create({ doctorId, patientId, date, time, status });
        res.status(201).json(appointment);
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Error creating appointment', error: error.message || 'Internal server error' });
    }
};

export const getAppointmentsByDoctor = async (req: Request, res: Response) => {
    try {
        const { doctorId } = req.params;
        const appointments = await Appointment.findAll({
            where: { doctorId },
            include: [{ model: User, as: 'patient', attributes: ['name', 'phone', 'email'] }],
        });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error });
    }
};

export const getAppointmentsByPatient = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.params;
        const appointments = await Appointment.findAll({
            where: { patientId },
            attributes: ['id', 'date', 'time', 'status', 'duration', 'createdAt', 'updatedAt'],
            include: [
                {
                    model: Doctor,
                    as: 'doctor', // From Appointment's @BelongsTo(() => Doctor)
                    attributes: ['specialty', 'description'],
                    include: [
                        {
                            model: User,
                            as: 'user', // From Doctor's @BelongsTo(() => User)
                            attributes: ['name', 'email', 'phone'],
                        }
                    ],
                },
            ],
        });

        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error in getAppointmentsByPatient:', error); // Add this to log what’s failing
        res.status(500).json({ message: 'Error fetching appointments', error });
    }
};

export const updateAppointment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { date, time, status } = req.body;
        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        // Validate updated date/time against schedule if provided
        if (date && time) {
            const validation = await validateAppointmentAgainstSchedule(appointment.doctorId, date, time);
            if (!validation.valid) {
                return res.status(400).json({ message: validation.message });
            }
        }

        // Validate status if provided
        if (status && !['pending', 'confirmed', 'completed', 'canceled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status, must be pending, confirmed, completed, or canceled' });
        }

        await appointment.update({ date, time, status });
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Error updating appointment', error });
    }
};

interface AuthenticatedRequest extends Request {
    user?: { id: number };
}

export const deleteAppointment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const appointmentId = parseInt(req.params.id, 10);

        if (isNaN(appointmentId)) {
            return res.status(400).json({ message: 'Invalid appointment ID' });
        }

        const appointment = await Appointment.findByPk(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (req.user && req.user.id !== appointment.doctorId) {
            return res.status(403).json({ message: 'Unauthorized to delete this appointment' });
        }

        await appointment.destroy();
        return res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return res.status(500).json({
            message: 'Error deleting appointment',
            error: error instanceof Error ? error.message : 'Internal server error',
        });
    }
};

export const updateAppointmentStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate appointment ID
        const appointmentId = parseInt(id, 10);
        if (isNaN(appointmentId)) {
            return res.status(400).json({ message: 'Invalid appointment ID' });
        }

        // Validate status
        if (!status || !['pending', 'confirmed', 'completed', 'canceled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status, must be pending, confirmed, completed, or canceled' });
        }

        // Find the appointment
        const appointment = await Appointment.findByPk(appointmentId, {
            include: [{ model: User, as: 'patient', attributes: ['name', 'phone', 'email'] }],
        });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Find doctor profile based on logged-in user's ID
        const doctorProfile = await Doctor.findOne({ where: { userId: req.user?.id } });

        if (!doctorProfile) {
            return res.status(403).json({ message: 'Doctor profile not found' });
        }

        // Check if this doctor is assigned to the appointment
        if (doctorProfile.id !== appointment.doctorId) {
            return res.status(403).json({ message: 'Unauthorized to update this appointment' });
        }

        // Update the status
        await appointment.update({ status });

        // Return the updated appointment
        res.status(200).json(appointment);
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({
            message: 'Error updating appointment status',
            error: error instanceof Error ? error.message : 'Internal server error',
        });
    }
};
