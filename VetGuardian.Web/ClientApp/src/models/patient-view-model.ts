export class PatientViewModel {
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
