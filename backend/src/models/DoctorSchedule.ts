import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement, Unique } from 'sequelize-typescript';
import { Doctor } from './Doctor';

@Table({
    tableName: 'doctor_schedules',
    timestamps: true,
})
export class DoctorSchedule extends Model<DoctorSchedule> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @ForeignKey(() => Doctor)
    @Unique
    @Column(DataType.INTEGER)
    doctorId!: number;

    @BelongsTo(() => Doctor, { foreignKey: 'doctorId', as: 'doctor' })
    doctor!: Doctor;

    @Column(DataType.JSON)
    availableDays!: string[];

    @Column(DataType.STRING)
    startHour!: string;

    @Column(DataType.STRING)
    startMinute!: string;

    @Column(DataType.STRING)
    startPeriod!: string;

    @Column(DataType.STRING)
    endHour!: string;

    @Column(DataType.STRING)
    endMinute!: string;

    @Column(DataType.STRING)
    endPeriod!: string;

    @Column(DataType.DATE)
    createdAt!: Date;

    @Column(DataType.DATE)
    updatedAt!: Date;
}