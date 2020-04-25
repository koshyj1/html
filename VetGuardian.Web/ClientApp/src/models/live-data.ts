import { ITuple } from "./tuple";

export interface LiveDatum {
    heartRate: number;
    respirationRate: number;
    motionDetected: boolean;
    unitId: string;
    timestamp: Date;
    hrFftValues: Array<ITuple<number,number>>;
    rrFftValues: Array<ITuple<number,number>>;
}

export interface LiveVideoFrame {
    frame: string;
    unitId: string;
}