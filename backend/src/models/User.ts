import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, HasOne } from 'sequelize-typescript';
import { Doctor } from './Doctor'; // Import the Doctor model

@Table({
    tableName: 'users',
    timestamps: true,
})
export class User extends Model<User> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @Column(DataType.STRING(255))
    name!: string;

    @Column(DataType.STRING(255))
    email!: string;

    @Column(DataType.STRING(20))
    phone!: string;

    @Column(DataType.DATEONLY)
    dob!: Date;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    password?: string;

    @Column(DataType.STRING(100))
    city!: string;

    @Column({
        type: DataType.ENUM('patient', 'doctor', 'admin'),
        defaultValue: 'patient',
    })
    user_type!: 'patient' | 'doctor' | 'admin';

    @Column(DataType.STRING)
    oauthId?: string;

    @HasOne(() => Doctor, { foreignKey: 'userId', as: 'doctor' }) // Define the HasOne relationship
    doctor!: Doctor;
}