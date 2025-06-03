import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize, { testConnection } from './config/database';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());

(async () => {
    try {
        await testConnection();
        // await sequelize.sync({ force: true }); // Use with caution; drops and recreates tables
        console.log('Database synced');
    } catch (err) {
        console.error('Error syncing database:', err);
    }
})();

app.use('/api/auth', authRoutes);

// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

