import { ModelBase } from './base';

export enum PatientStatus {
    None,           // the unit is off or unoccupied
    Good,           // all signs are within the expected range
    Warning,        // one or more signs are within the warning range, and none are within the alarm range
    TimerWarning,   // all signs are within the expected range, but the patient is over the expected duration
    Alarm           // one or more signs are within the alarm range
}

export class Patient implements ModelBase {
    id: string;
    timestamp: Date;
    modified: Date;
    name: string;
    ownerName: string;
    species: number;
    breed: string;
    age: number;
    birthDate: Date;
    weight: number;
    sex: number;
    heartRateLowAlarm: number;
    heartRateLowWarning: number;
    heartRateHighAlarm: number;
    heartRateHighWarning: number;
    respirationRateLowAlarm: number;
    respirationRateLowWarning: number;
    respirationRateHighAlarm: number;
    respirationRateHighWarning: number;
    warningTimer: number;
    patientId?: string;
    weightUnit: number;
    temperatureUnit: number;

    constructor() {
        this.name = "";
        this.ownerName = "";
        this.age = 0;
    }
}
