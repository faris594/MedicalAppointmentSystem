import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'medical_appointment',
    port: Number(process.env.DB_PORT) || 3306,
    logging: console.log, // Enable for debugging
    define: {
        timestamps: true,
        underscored: true,
    },
    models: [__dirname + '/../models/*.ts'], // Use absolute path for model files
});

// Test the connection
export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export default sequelize;