import { ModelBase } from './base';
import { Patient } from './patient';
import { Run } from './run';

export enum UnitStatusFlags {
    None                    = 0,        // 000 0000 0000 0000 0000
    Occupied                = 1 << 0,   // 000 0000 0000 0000 0001 -- bit shift is unnecessary, but done for consistency
    AcquiringData           = 1 << 1,   // 000 0000 0000 0000 0010
    CapturingVideo          = 1 << 2,   // 000 0000 0000 0000 0100
    Publishing              = 1 << 3,   // 000 0000 0000 0000 1000
    SensorError             = 1 << 4,   // 000 0000 0000 0001 0000
    CameraError             = 1 << 5,   // 000 0000 0000 0010 0000
    Warning                 = 1 << 6,   // 000 0000 0000 0100 0000
    Alarm                   = 1 << 7,   // 000 0000 0000 1000 0000
    MotionDetected          = 1 << 8,   // 000 0000 0001 0000 0000
    TimerWarning            = 1 << 9,   // 000 0000 0010 0000 0000
    RespiratoryRateWarning  = 1 << 10,  // 000 0000 0100 0000 0000
    RespiratoryRateAlarm    = 1 << 11,  // 000 0000 1000 0000 0000
    HeartRateWarning        = 1 << 12,  // 000 0001 0000 0000 0000
    HeartRateAlarm          = 1 << 13,  // 000 0010 0000 0000 0000
    SensorConnectionError   = 1 << 14,  // 000 0100 0000 0000 0000
    BodyDetected            = 1 << 15,  // 000 1000 0000 0000 0000
    Paused                  = 1 << 16,  // 001 0000 0000 0000 0000
    AlarmAcknowledged       = 1 << 17,  // 010 0000 0000 0000 0000
    InitalBodyDetect        = 1 << 18,  // 100 0000 0000 0000 0000
}

export class Unit implements ModelBase {
    id: string;
    timestamp: Date;
    modified: Date;
    name: string;
    serialNumber: number;
    cameraHostname: string;
    cameraUsername: string;
    cameraPassword: string;
    sensorIpAddress: string;
    simulate: boolean;
    initializationDelay: number;
}

export class UnitSummary {
    unitId: string;
    motionDetected: boolean;
    heartRate: number;
    respirationRate: number;
    inUse: boolean;
    currentPatient: Patient;
    currentRun: Run;
    status: UnitStatusFlags;
    runTime: number;
}