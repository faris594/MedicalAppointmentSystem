import { Request, Response } from 'express';
import { User } from '../models/User';

export const getPatients = async (req: Request, res: Response) => {
    try {
        const patients = await User.findAll({
            where: { user_type: 'patient' },
            attributes: ['id', 'name', 'email', 'phone', 'dob', 'city'],
        });

        const formattedPatients = patients.map((patient) => ({
            id: patient.id,
            name: patient.name || 'Unknown',
            email: patient.email || 'Unknown',
            city: patient.city || 'Unknown',
            number: patient.phone || 'Unknown',
            dob: patient.dob || 'Unknown',
        }));

        res.json(formattedPatients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patients', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
