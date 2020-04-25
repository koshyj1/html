import { ModelBase } from './base';
import { Patient } from './patient';
import { Staff } from './staff';

export class Run implements ModelBase {
    id: string;
    timestamp: Date;
    modified: Date;
    patientId: string;
    unitId: string;
    weight?: number;
    heartRateLowAlarm: number;
    heartRateLowWarning: number;
    heartRateHighAlarm: number;
    heartRateHighWarning: number;
    respirationRateLowAlarm: number;
    respirationRateLowWarning: number;
    respirationRateHighAlarm: number;
    respirationRateHighWarning: number;
    warningTimer: number;
    weightUnit: number;
    temperatureUnit: number;
    attendingDoctorId?: string;
    vetTechId?: string;
}

export class RunAndPatient {
    run: Run;
    attendingDoctor?: Staff;
    VetTech?: Staff;
    patient: Patient;
}