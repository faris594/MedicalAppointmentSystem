import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request to include user property
interface AuthenticatedRequest extends Request {
    user?: { id: number; email: string; user_type: string };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Expect "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '123') as {
            id: number;
            email: string;
            user_type: string;
        };
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            message: 'Invalid token',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};