import { Request, Response } from 'express';
import { Doctor } from '../models/Doctor';
import { User } from '../models/User';

export const getDoctors = async (req: Request, res: Response) => {
    try {
        const doctors = await Doctor.findAll({
            attributes: ['id', 'specialty'],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'email', 'phone', 'dob', 'city'],
                    where: { user_type: 'doctor' }, // Ensure only doctor users are included
                },
            ],
        });

        const formattedDoctors = doctors.map((doctor) => ({
            id: doctor.id,
            name: doctor.user?.name || 'Unknown',
            email: doctor.user?.email || 'Unknown',
            city: doctor.user?.city || 'Unknown',
            number: doctor.user?.phone || 'Unknown',
            dob: doctor.user?.dob || 'Unknown',
            specialty: doctor.specialty || 'Unknown',
        }));

        res.json(formattedDoctors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }
};

export const getDoctorById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const doctor = await Doctor.findOne({
            where: { id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'phone', 'dob', 'city', 'user_type'],
                },
            ],
        });

        if (!doctor || !doctor.user || doctor.user.user_type !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const fullProfile = {
            id: doctor.id,
            specialty: doctor.specialty,
            description: doctor.description,
            user: doctor.user,
        };

        res.json(fullProfile);
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
