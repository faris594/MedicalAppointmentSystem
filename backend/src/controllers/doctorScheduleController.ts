import { Request, Response } from 'express';
import { DoctorSchedule } from '../models/DoctorSchedule';

export const createOrUpdateSchedule = async (req: Request, res: Response) => {
    try {
        const { doctorId, availableDays, startHour, startMinute, startPeriod, endHour, endMinute, endPeriod } = req.body;
        let schedule = await DoctorSchedule.findOne({ where: { doctorId } });
        if (schedule) {
            await schedule.update({
                availableDays,
                startHour,
                startMinute,
                startPeriod,
                endHour,
                endMinute,
                endPeriod,
            });
        } else {
            schedule = await DoctorSchedule.create({
                doctorId,
                availableDays,
                startHour,
                startMinute,
                startPeriod,
                endHour,
                endMinute,
                endPeriod,
            });
        }
        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Error creating/updating schedule', error });
    }
};

export const getScheduleByDoctor = async (req: Request, res: Response) => {
    try {
        const { doctorId } = req.params;
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