import { Request, Response } from 'express';
import { DoctorSchedule } from '../models/DoctorSchedule';
import { Doctor } from '../models/Doctor';
import { Request, Response } from 'express';
import { DoctorSchedule } from '../models/DoctorSchedule';

export const createOrUpdateSchedule = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user || user.user_type !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can manage schedules' });
        }

        // 🔁 Lookup doctor ID using user ID
        const doctor = await Doctor.findOne({ where: { user_id: user.id } });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found for user' });
        }

        const {
            availableDays,
            startHour,
            startMinute,
            startPeriod,
            endHour,
            endMinute,
            endPeriod,
        } = req.body;

        const [schedule, created] = await DoctorSchedule.upsert({
            doctorId: doctor.id,
            availableDays,
            startHour,
            startMinute,
            startPeriod,
            endHour,
            endMinute,
            endPeriod,
        }, { returning: true });

        res.status(200).json(schedule);
    } catch (error: any) {
        console.error('Error creating/updating schedule:', error);
        res.status(500).json({
            message: 'Error creating/updating schedule',
            error: error.message || error,
        });
    }
};



export const getScheduleByDoctor = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        let doctorId = req.params.doctorId;

        // If a doctor is requesting their own schedule and no ID is passed
        if (!doctorId && user && user.user_type === 'doctor') {
            doctorId = user.id;
        }

        if (!doctorId) {
            return res.status(400).json({ message: 'Doctor ID is required' });
        }

        const schedule = await DoctorSchedule.findOne({ where: { doctorId } });
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedule', error });
    }
};


export const updateSchedule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { availableDays, startHour, startMinute, startPeriod, endHour, endMinute, endPeriod } = req.body;
        const schedule = await DoctorSchedule.findByPk(id);
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
        await schedule.update({ availableDays, startHour, startMinute, startPeriod, endHour, endMinute, endPeriod });
        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Error updating schedule', error });
    }
};

export const deleteSchedule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const schedule = await DoctorSchedule.findByPk(id);
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
        await schedule.destroy();
        res.status(200).json({ message: 'Schedule deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting schedule', error });
    }
};