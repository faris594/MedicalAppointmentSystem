import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement, HasOne } from 'sequelize-typescript';
import { User } from './User';
import { DoctorSchedule } from './DoctorSchedule';

@Table({
    tableName: 'doctors',
    timestamps: true,
})
export class Doctor extends Model<Doctor> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @Column(DataType.STRING(100))
    specialty!: string;

    @Column(DataType.TEXT)
    description!: string;

    @HasOne(() => DoctorSchedule, { foreignKey: 'doctorId', as: 'schedule' })
    schedule!: DoctorSchedule;
}
