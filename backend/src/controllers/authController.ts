import { Request, Response } from 'express';
import { User } from '../models/User';
import { Doctor } from '../models/Doctor'; // Import the Doctor model
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response) => {
    const { name, email, phone, dob, password, city, user_type, specialty, description } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !dob || !password || !city) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate dob format (basic check)
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date of birth format' });
    }

    // Validate user_type if provided
    const validUserTypes = ['patient', 'doctor', 'admin'] as const;
    if (user_type && !validUserTypes.includes(user_type)) {
        return res.status(400).json({ message: 'Invalid user type' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // @ts-ignore
        const newUser = await User.create({
            name,
            email,
            phone,
            dob: dobDate,
            password: hashedPassword,
            city,
            user_type: user_type || 'patient', // Default to patient if not provided
        });

        // Create Doctor record if user_type is 'doctor'
        if (newUser.user_type === 'doctor') {
            if (!specialty || !description) {
                return res.status(400).json({ message: 'Specialty and description are required for doctors' });
            }
            // @ts-ignore
            await Doctor.create({
                userId: newUser.id,
                specialty,
                description,
            });
        }

        await sendConfirmationEmail(newUser.email, newUser.name);

        return res.status(201).json({ message: 'Registration successful', userId: newUser.id });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            message: 'Something went wrong',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const sendConfirmationEmail = async (to: string, name: string) => {
    // Transporter using Gmail (use environment variables in production!)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // your gmail address
            pass: process.env.EMAIL_PASS, // app password or actual password (not recommended)
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Welcome to the Medical Appointment System!',
        html: `
            <h3>Hi ${name},</h3>
            <p>Thank you for registering on our Medical Appointment System.</p>
            <p>We’re glad to have you on board!</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${to}`);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token with user data
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                dob: user.dob,
                city: user.city,
                user_type: user.user_type,
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        return res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Something went wrong',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const oauthLogin = async (req: Request, res: Response) => {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "No credential provided" });

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) throw new Error("Invalid token");

        const { email, name, sub } = payload;

        // Try to find user by oauth_id (Google sub)
        let user = await User.findOne({ where: { oauthId: sub } });

        if (!user) {
            // Create user only once if not found
            user = await User.create({
                name,
                email,
                oauthId: sub,
                user_type: 'patient',
            });
        }

        if (!user) {
            return res.status(500).json({ message: "User creation failed, please try again." });
        }

        const incompleteProfile = !user.phone || !user.dob || !user.city;

        const token = jwt.sign(
            { id: user.id, email: user.email, user_type: user.user_type },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        return res.status(200).json({ token, incompleteProfile });
    } catch (err) {
        console.error("OAuth login error:", err);
        return res.status(500).json({ message: "Failed to verify token" });
    }
};





export const completeProfile = async (req: Request, res: Response) => {
    const { phone, dob, city, specialty, description } = req.body;

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    let decoded: any;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = decoded.id;

    if (!phone || !dob || !city) {
        return res.status(400).json({ message: 'Phone, date of birth, and city are required' });
    }

    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date of birth format' });
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.phone = phone;
        user.dob = dobDate;
        user.city = city;
        await user.save();

        if (user.user_type === 'doctor') {
            if (!specialty || !description) {
                return res.status(400).json({ message: 'Specialty and description are required for doctors' });
            }

            const doctorProfile = await Doctor.findOne({ where: { userId: user.id } });
            if (doctorProfile) {
                doctorProfile.specialty = specialty;
                doctorProfile.description = description;
                await doctorProfile.save();
            } else {
                await Doctor.create({
                    userId: user.id,
                    specialty,
                    description,
                });
            }
        }

        return res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Complete profile error:', error);
        return res.status(500).json({ message: 'Something went wrong', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};




export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findByPk(req.user?.id, {
            attributes: ['id', 'name', 'email', 'phone', 'dob', 'city', 'user_type'],
            include: [
                {
                    model: Doctor,
                    as: 'doctor', // Matches the default alias from BelongsTo
                    attributes: ['specialty', 'description'],
                },
            ],
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        return res.status(500).json({
            message: 'Something went wrong',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};