import { ModelBase } from './base';

export enum StaffType {
    AttendingDoctor = 1,
    VetTech = 2,
}

export class Staff implements ModelBase {
    id: string;
    timestamp: Date;
    modified: Date;
    
    staffType: StaffType;
    firstName: string;
    lastName: string;

    constructor() {
        this.firstName = "";
        this.lastName = "";
    }
}