import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Doctor } from './Doctor';
import { User } from './User';

@Table({
    tableName: 'appointments',
    timestamps: true,
})
export class Appointment extends Model<Appointment> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @ForeignKey(() => Doctor)
    @Column(DataType.INTEGER)
    doctorId!: number;

    @BelongsTo(() => Doctor)
    doctor!: Doctor;

    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    patientId!: number;

    @BelongsTo(() => User)
    patient!: User;

    @Column(DataType.DATEONLY)
    date!: Date;

    @Column(DataType.STRING)
    time!: string;

    @Column(DataType.ENUM('pending', 'confirmed', 'completed', 'canceled'))
    status!: 'pending' | 'confirmed' | 'completed' | 'canceled';

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 60, // 1 hour in minutes
    })
    duration!: number;

    @Column(DataType.DATE)
    createdAt!: Date;

    @Column(DataType.DATE)
    updatedAt!: Date;
}