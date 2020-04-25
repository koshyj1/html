import { ModelBase } from './base';

export enum LogType {
    System = 1,
    User = 2,
    Warning = 3,
    Alarm = 4,
    Debug = 5
}

export class LogEntry implements ModelBase {
    id: string;
    runId: string;
    timestamp: Date;
    modified: Date;
    message: string;
    logType: LogType;
}