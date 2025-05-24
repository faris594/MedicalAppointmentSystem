import { Router } from 'express';
import { register, login, getUserProfile, oauthLogin, completeProfile  } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { createOrUpdateSchedule, getScheduleByDoctor, updateSchedule, deleteSchedule } from '../controllers/doctorScheduleController';
import { createAppointment, getAppointmentsByDoctor, updateAppointment, deleteAppointment } from '../controllers/appointmentController';
import { getDoctors, getDoctorById  } from '../controllers/doctorController';
import { getPatients } from '../controllers/patientController';
import { getAppointments, updateAppointmentStatus, getAppointmentsByPatient  } from '../controllers/appointmentController';

const router = Router();

router.post('/oauth-login', oauthLogin);
router.post('/register', register);
router.post('/login', login);
router.post('/complete-profile', authenticateToken, completeProfile);
router.get('/profile', authenticateToken, getUserProfile);
router.get('/protected', authenticateToken, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    res.json({
        message: 'Protected route accessed',
        user: {
            id: req.user.id,
            email: req.user.email,
            user_type: req.user.user_type,
        },
    });
});

// Schedule routes
router.post('/schedule', authenticateToken, createOrUpdateSchedule);
router.get('/schedule/doctor/:doctorId', authenticateToken, getScheduleByDoctor);
router.put('/schedule/:id', authenticateToken, updateSchedule);
router.delete('/schedule/:id', authenticateToken, deleteSchedule);

// Appointment routes
router.post('/appointment', authenticateToken, createAppointment);
router.get('/appointments', authenticateToken, getAppointments);
router.get('/appointments/doctor/:doctorId', authenticateToken, getAppointmentsByDoctor);
router.get('/appointments/patient/:patientId', authenticateToken, getAppointmentsByPatient);
router.put('/appointment/:id', authenticateToken, updateAppointment);
router.delete('/appointment/:id', authenticateToken, deleteAppointment);
router.patch('/appointment/:id/status', authenticateToken, updateAppointmentStatus);


// New Doctor route
router.get('/doctors', authenticateToken, getDoctors);
router.get('/doctors/:id', authenticateToken, getDoctorById);

// Patient routes
router.get('/patients', authenticateToken, getPatients);

export default router;
