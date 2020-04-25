export interface ChartingSettings {
    enableAlarm: boolean;
}

export interface FTPSettings {
    enabled: boolean;
    hostname: string;
    userName: string;
    password: string;
    rootPath: string;
}

export interface FFTSettings {
    motionThreshold: number;
    motionDelay: number;
    hrMagnitude: number;
    sampleSize: number;
    sampleRate: number;
    sampleSizeRR: number;
    presenceSampleSize: number;
    presenceSampleRate: number;
    displayAverageSeconds: number;
    displayAverageSecondsRR: number;
}

export interface BodyDetectionSettings {
    enableBodyDetect: boolean;
    presenceDetectCount: number;
    detectionType?: number;
}

export interface CloudSettings {
    enabled: boolean;
    runDataCloudEndpoint: string;
}

export interface AdminSettings {
    chartingSettings: ChartingSettings,
    ftpSettings: FTPSettings;
    fftSettings: FFTSettings;
    bodyDetectionSettings: BodyDetectionSettings;
    cloudSettings: CloudSettings;
}