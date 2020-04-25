import { Unit } from './unit';

export class Device {
    serialNumber: number;
    ipAddress: string;
    connectionType: string;
    unit: Unit;
}