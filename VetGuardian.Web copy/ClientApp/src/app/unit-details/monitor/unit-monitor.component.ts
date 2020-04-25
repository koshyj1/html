import { Component, Input, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subject, Subscription, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { RunLogComponent } from 'src/app/run-log/run-log.component';

import { ApiService } from 'src/services/api/api.service';
import { DataService } from '../../../services/data/data.service';
import { FormGroupCustom } from 'src/shared/form-group-custom';

import { Unit, UnitStatusFlags } from 'src/models/unit';
import { Patient } from 'src/models/patient';
import { IconService } from 'src/services/icon/icon.service';
import { EnumService } from 'src/services/enum/enum.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ITuple } from 'src/models/tuple';


@Component({
    selector: 'vg-unit-monitor',
    templateUrl: './unit-monitor.component.html',
    styleUrls: ['./unit-monitor.component.scss']
})
export class UnitMonitorComponent implements AfterViewInit {
    @ViewChild('runLog') runLog: RunLogComponent;
    @ViewChild('temperatureInput') temperatureInput: ElementRef;
    @ViewChild('heartrateInput') heartrateInput: ElementRef;
    @ViewChild('respirationrateInput') respirationrateInput: ElementRef;

    private _unitId: string;
    @Input() public set unitId(value) {
        this.clearSubscriptions();
        this.heartRate = undefined;
        this.respirationRate = undefined;
        this.videoEnabled = undefined;
        this._unitId = value;
        this.getUnitInfo();
        this.subscribeData();
    }
    public get unitId() { let x = this._unitId; return x; }

    public runId: string;
    public logsMaxHeight: number;

    public heartRate: number;
    public respirationRate: number;
    public breed: string;
    public birthDate: Date;
    public weight: number;
    public weightUnit: string;
    public temperatureUnit: string;
    public runTime: number;
    public unitStatus: number;
    public patient: Patient;
    public unitName: string;
    public videoEnabled: boolean;
    public motionDetected: boolean;
    public paused: boolean;
    public isOccupied: boolean;
    public isAcquiring: boolean;

    public initializing: boolean = true;
    public initializationDelay: number;

    private subscriptions: Subscription[] = [];
    public onDataRR: Subject<number> = new Subject();
    public onDataHR: Subject<number> = new Subject();
    public onDataRRFFT: Subject<Array<ITuple<number, number>>> = new Subject();
    public onDataHRFFT: Subject<Array<ITuple<number, number>>> = new Subject();

    public hiHeartAlarm: number = null;
    public loHeartAlarm: number = null;
    public hiHeartWarning: number = null;
    public loHeartWarning: number = null;
    public hiRespirationAlarm: number = null;
    public loRespirationAlarm: number = null;
    public hiRespirationWarning: number = null;
    public loRespirationWarning: number = null;

    public pauseForm: FormGroupCustom = new FormGroupCustom({
        heartRateLowAlarm: new FormControl(null, [
            Validators.required,
            Validators.min(1),
            Validators.max(999)
        ]),
        heartRateLowWarning: new FormControl(null, [
            Validators.required,
            Validators.min(1),
            Validators.max(999)
        ]),
        heartRateHighWarning: new FormControl(null, [
            Validators.required,
            Validators.min(1),
            Validators.max(999)
        ]),
        heartRateHighAlarm: new FormControl(null, [
            Validators.required,
            Validators.min(1),
            Validators.max(999)
        ]),
        respirationRateLowAlarm: new FormControl(null, [
            Validators.required,
            Validators.min(1),
            Validators.max(999)
        ]),
        respirationRateLowWarning: new FormControl(null, [
            Validators.required,
            Validators.min(1),
            Validators.max(999)
        ]),
        respirationRateHighWarning: new FormControl(null, [
            Validators.required,
            Validators.min(1),
            Validators.max(999)
        ]),
        respirationRateHighAlarm: new FormControl(null, [
            Validators.required,
            Validators.min(1),
            Validators.max(999)
        ])
    });

    constructor(
        private apiService: ApiService,
        private enumService: EnumService,
        private dataService: DataService,
        public iconService: IconService) { }

    async ngOnInit() {
        this.initPauseForm();
        this.initChartData();
    }

    ngOnDestroy() {
        this.clearSubscriptions();
    }

    ngAfterViewInit(){
        this.onResize();
    }

    @HostListener('window:resize', ['$event'])
    private onResize(event?: any) {
        const page = document.getElementsByClassName('router-wrapper')[0];
        const pageHeight = page.clientHeight;

        const statusBar = document.getElementsByClassName('status-bar')[0];
        const statusBarHeight = statusBar.clientHeight;

        const charts = document.getElementById('charts');
        const chartsHeight = charts.clientHeight;

        const offset = 67;
        setTimeout(() => this.logsMaxHeight = (pageHeight - statusBarHeight - chartsHeight - offset));
    };

    private initPauseForm() {
        this.subscriptions.push(
            this.dataService.getOnUnitSummary().pipe(
                filter(t => t.unitId === this._unitId),
                take(1)
            ).subscribe(unitSummary => {
                if (unitSummary.currentPatient) {
                    this.pauseForm.patchValue({
                        heartRateLowAlarm: unitSummary.currentPatient.heartRateLowAlarm,
                        heartRateLowWarning: unitSummary.currentPatient.heartRateLowWarning,
                        heartRateHighWarning: unitSummary.currentPatient.heartRateHighWarning,
                        heartRateHighAlarm: unitSummary.currentPatient.heartRateHighAlarm,
                        respirationRateLowAlarm: unitSummary.currentPatient.respirationRateLowAlarm,
                        respirationRateLowWarning: unitSummary.currentPatient.respirationRateLowWarning,
                        respirationRateHighWarning: unitSummary.currentPatient.respirationRateHighWarning,
                        respirationRateHighAlarm: unitSummary.currentPatient.respirationRateHighAlarm
                    });
                }
            })
        );
    }

    private clearSubscriptions(): void {
        while (this.subscriptions.length > 0) {
            this.subscriptions.pop().unsubscribe();
        }
    }

    private subscribeData(): void {
        this.subscribeLiveData();
        this.subscribeUnitSummary();
    }

    private subscribeLiveData(): void {
        this.subscriptions.push(
            this.dataService.getOnLiveData().pipe(filter(t => t.unitId === this._unitId)).subscribe(t => {
                this.onDataHR.next(t.heartRate);
                this.onDataRR.next(t.respirationRate);
                this.onDataHRFFT.next(t.hrFftValues);
                this.onDataRRFFT.next(t.rrFftValues);
                this.heartRate = t.heartRate;
                this.respirationRate = t.respirationRate;
            })
        );
    }

    private subscribeUnitSummary(): void {
        this.subscriptions.push(
            this.dataService.getOnUnitSummary().pipe(filter(t => t.unitId === this._unitId)).subscribe(t => {
                this.runId = t.currentRun.id;
                if (t.currentPatient) {
                    this.breed = t.currentPatient.breed;
                    this.birthDate = t.currentPatient.birthDate;
                    this.weight = t.currentPatient.weight;
                    this.weightUnit = this.enumService.getWeightUnitInitials(t.currentPatient.weightUnit);
                    this.temperatureUnit = this.enumService.getTemperatureUnitInitials(t.currentPatient.temperatureUnit);
                    this.hiHeartAlarm = t.currentPatient.heartRateHighAlarm;
                    this.loHeartAlarm = t.currentPatient.heartRateLowAlarm;
                    this.hiHeartWarning = t.currentPatient.heartRateHighWarning;
                    this.loHeartWarning = t.currentPatient.heartRateLowWarning;
                    this.hiRespirationAlarm = t.currentPatient.respirationRateHighAlarm;
                    this.loRespirationAlarm = t.currentPatient.respirationRateLowAlarm;
                    this.hiRespirationWarning = t.currentPatient.respirationRateHighWarning;
                    this.loRespirationWarning = t.currentPatient.respirationRateLowWarning;
                } else {
                    this.breed = null;
                    this.birthDate = null;
                    this.weight = null;
                    this.weightUnit = null;
                    this.temperatureUnit = null;
                    this.hiHeartAlarm = null;
                    this.loHeartAlarm = null;
                    this.hiHeartWarning = null;
                    this.loHeartWarning = null;
                    this.hiRespirationAlarm = null;
                    this.loRespirationAlarm = null;
                    this.hiRespirationWarning = null;
                    this.loRespirationWarning = null;
                }
                this.runTime = t.runTime;
                this.unitStatus = t.status;
                this.patient = t.currentPatient;
                this.motionDetected = UnitStatusFlags.MotionDetected === (UnitStatusFlags.MotionDetected & t.status);
                this.paused = UnitStatusFlags.Paused === (UnitStatusFlags.Paused & t.status);
                this.isOccupied = (UnitStatusFlags.Occupied === (UnitStatusFlags.Occupied & t.status));
                this.isAcquiring = (UnitStatusFlags.AcquiringData === (UnitStatusFlags.AcquiringData & t.status));;
                this.videoEnabled = UnitStatusFlags.CapturingVideo === (UnitStatusFlags.CapturingVideo & t.status);
            })
        );
    }

    private async getUnitInfo(): Promise<void> {
        if (this._unitId) {
            let unit = await this.apiService.getUnit(this._unitId);
            this.unitName = unit.name;
            this.initializationDelay = unit.initializationDelay;
        } else {
            this.unitName = null;
            this.initializationDelay = 0;
        }
    }

    async acknowledgeAlarm(){
        this.apiService.acknowledgeAlarm(this.unitId);
    }

    async startRun() {
        this.pauseForm.submitted = true;

        this.patient.heartRateLowWarning = this.pauseForm.value.heartRateLowWarning;
        this.patient.heartRateHighWarning = this.pauseForm.value.heartRateHighWarning;
        this.patient.heartRateLowAlarm = this.pauseForm.value.heartRateLowAlarm;
        this.patient.heartRateHighAlarm = this.pauseForm.value.heartRateHighAlarm;

        this.patient.respirationRateLowWarning = this.pauseForm.value.respirationRateLowWarning;
        this.patient.respirationRateHighWarning = this.pauseForm.value.respirationRateHighWarning;
        this.patient.respirationRateLowAlarm = this.pauseForm.value.respirationRateLowAlarm;
        this.patient.respirationRateHighAlarm = this.pauseForm.value.respirationRateHighAlarm;

        await this.apiService.updatePatient(this.patient.id, this.patient)
            .then(async (response) => {
                await this.apiService.startDataAcquisition(
                    this.unitId,
                    this.patient.id
                );
            })
            .catch((err: HttpErrorResponse) => {
                this.pauseForm.addErrors(err.error);
            });
    }

    displayPauseOption: boolean = false;
    async pauseRun() {
        this.displayPauseOption = true;
        await this.apiService.pauseDataAcquisition(this._unitId);
    }

    onUpdateLimitForm(canEditLimits: boolean = false) {
        if (!canEditLimits) {
            this.pauseForm.disable();
        } else {
            this.pauseForm.enable();
        }

        this.displayPauseOption = false;
    }

    async stopRun() {
        await this.apiService.stopDataAcquisition(this._unitId);
    }

    public setTemperature() {
        let input = this.temperatureInput.nativeElement as HTMLInputElement;
        let temp = input.valueAsNumber;
        if (isNaN(temp)) {
            this.apiService.setTemperature(this._unitId, null).then(() => { console.log('temperature cleared'); input.value = ''; });
        } else {
            this.apiService.setTemperature(this._unitId, temp).then(() => { console.log('temperature updated'); input.value = ''; });
        }
    }

    public setHeartrate() {
        let input = this.heartrateInput.nativeElement as HTMLInputElement;
        let hr = input.valueAsNumber;
        if (isNaN(hr)) {
            this.apiService.setHeartrate(this._unitId, null).then(() => { console.log('hr cleared'); input.value = ''; });
        } else {
            this.apiService.setHeartrate(this._unitId, hr).then(() => { console.log('hr updated'); input.value = ''; });
        }
    }

    public setRespirationRate() {
        let input = this.respirationrateInput.nativeElement as HTMLInputElement;
        let rr = input.valueAsNumber;
        if (isNaN(rr)) {
            this.apiService.setRespirationRate(this._unitId, null).then(() => { console.log('rr cleared'); input.value = ''; });
        } else {
            this.apiService.setRespirationRate(this._unitId, rr).then(() => { console.log('rr updated'); input.value = ''; });
        }
    }

    private initChartData() {
        this.initHRDataSet();
        this.initRRDataSet();
        this.initFFTHRDataSet();
        this.initFFTRRDataSet();
    }

    private getWarningAlarmDataSet(
        hiHeartAlarm?: any,
        loHeartAlarm?: any,
        hiHeartWarning?: any,
        loHeartWarning?: any
    ) {
        return [
            {
                label: 'highAlarm',
                borderColor: '#FF000040',
                backgroundColor: '#FF000040',
                pointRadius: 0,
                fill: 'end',
                data: hiHeartAlarm
            }, {
                label: 'lowAlarm',
                borderColor: '#FF000040',
                backgroundColor: '#FF000040',
                pointRadius: 0,
                fill: 'start',
                data: loHeartAlarm
            }, {
                label: 'highWarning',
                borderColor: '#00AAAA',
                borderDash: [15, 15],
                borderWidth: 1,
                pointRadius: 0,
                fill: false,
                data: hiHeartWarning
            }, {
                label: 'lowWarning',
                borderColor: '#00AAAA',
                borderDash: [15, 15],
                borderWidth: 1,
                pointRadius: 0,
                fill: false,
                data: loHeartWarning
            }
        ];
    }

    private updateChartData(newData: number, chartData: any) {
        var data = chartData;

        if (this.motionDetected) {
            // shift the timestamps on the displayed points but do not change the values
            for (let i = 0; i < data.length - 1; i++) {
                data[i].t = data[i + 1].t;
            }
            data[data.length - 1].t = new Date();
        }
        else {
            // add the new point to the series
            data.push({
                t: new Date(),
                y: newData
            });
            while (data.length > 30) {
                data.shift();
            }
        }

        return data;
    }

    private updateAlertWarningChartData(chartData: any, type: string) {
        const data: any[] = chartData;

        const time1 = data[0].t;
        const time2 = data[data.length - 1].t;

        var hiAlarm, loAlarm, hiWarning, loWarning;

        switch (type) {
            case "FFTHR":
            case "HR":
                hiAlarm = this.hiHeartAlarm;
                loAlarm = this.loHeartAlarm;
                hiWarning = this.hiHeartWarning;
                loWarning = this.loHeartWarning;
                break;
            case "FFTRR":
            case "RR":
                hiAlarm = this.hiRespirationAlarm;
                loAlarm = this.loRespirationAlarm;
                hiWarning = this.hiRespirationWarning;
                loWarning = this.loRespirationWarning;
                break;
        }

        return {
            hiAlarm: [
                { t: time1, y: hiAlarm },
                { t: time2, y: hiAlarm }
            ],
            loAlarm: [
                { t: time1, y: loAlarm },
                { t: time2, y: loAlarm }
            ],
            hiWarning: [
                { t: time1, y: hiWarning },
                { t: time2, y: hiWarning }
            ],
            loWarning: [
                { t: time1, y: loWarning },
                { t: time2, y: loWarning }
            ]
        };
    }

    public hrDataSet: Array<any> = [];
    public initHRDataSet() {
        const recentData = this.dataService.getRecentData(this.unitId).map(x => ({ t: x.timestamp, y: x.heartRate }));
        this.initializing = recentData.length === 0;

        const initData = [{
            data: recentData,
            label: "Heart Rate",
            borderColor: '#50FF53',
            fill: false
        }];

        this.hrDataSet = [...initData, ...this.getWarningAlarmDataSet()];

        this.subscriptions.push(
            this.onDataHR.subscribe(newDataPoint => {
                this.initializing = false;

                const newDataSet = this.updateChartData(newDataPoint, this.hrDataSet[0].data);
                const warningAlarm = this.updateAlertWarningChartData(this.hrDataSet[0].data, "HR");

                var hrData = Object.assign({}, this.hrDataSet[0]);
                hrData.data = newDataSet;

                this.hrDataSet = [...[hrData], ...this.getWarningAlarmDataSet(
                    warningAlarm.hiAlarm,
                    warningAlarm.loAlarm,
                    warningAlarm.hiWarning,
                    warningAlarm.loWarning
                )];
            })
        );
    }

    public rrDataSet: Array<any> = [];
    public initRRDataSet() {
        const recentData = this.dataService.getRecentData(this.unitId).map(x => ({ t: x.timestamp, y: x.respirationRate }));
        this.initializing = recentData.length === 0;

        const initData = [{
            data: recentData,
            label: "Respiration Rate",
            borderColor: '#42CCFB',
            fill: false
        }];

        this.rrDataSet = [...initData, ...this.getWarningAlarmDataSet()];

        this.subscriptions.push(
            this.onDataRR.subscribe(newDataPoint => {
                this.initializing = false;

                const newDataSet = this.updateChartData(newDataPoint, this.rrDataSet[0].data);
                const warningAlarm = this.updateAlertWarningChartData(this.rrDataSet[0].data, "RR");

                var rrData = Object.assign({}, this.rrDataSet[0]);
                rrData.data = newDataSet;

                this.rrDataSet = [...[rrData], ...this.getWarningAlarmDataSet(
                    warningAlarm.hiAlarm,
                    warningAlarm.loAlarm,
                    warningAlarm.hiWarning,
                    warningAlarm.loWarning
                )];
            })
        );
    }

    public fftHRDataSet: Array<any> = [];
    public initFFTHRDataSet() {
        const recentData = this.dataService.getRecentData(this.unitId).map(x => ({ hrFftValues: x.hrFftValues }));
        this.initializing = recentData.length === 0;

        const initData = [{
            data: recentData[0].hrFftValues.map((point: any) => ({ x: point.item1, y: point.item2 })),
            label: "Heart Rate FFT",
            borderColor: '#50FF53',
            fill: false,
            showLine: true
        }];

        this.fftHRDataSet = [...initData, ...this.getWarningAlarmDataSet()];

        this.subscriptions.push(
            this.onDataHRFFT.subscribe((newDataPoint: Array<ITuple<number, number>>) => {
                this.initializing = false;

                var fftHRData = Object.assign({}, this.fftHRDataSet[0]);
                fftHRData.data = newDataPoint.map((point: ITuple<number, number>) => ({ x: point.item1, y: point.item2 }));
                this.fftHRDataSet = [fftHRData];
            })
        );
    }

    public fftRRDataSet: Array<any> = [];
    public initFFTRRDataSet() {
        const recentData = this.dataService.getRecentData(this.unitId).map(x => ({ rrFftValues: x.rrFftValues }));
        this.initializing = recentData.length === 0;

        const initData = [{
            data: recentData[0].rrFftValues.map((point: ITuple<number, number>) => ({ x: point.item1, y: point.item2 })),
            label: "Respiration Rate FFT",
            borderColor: '#42CCFB',
            fill: false,
            showLine: true
        }];

        this.fftRRDataSet = [...initData, ...this.getWarningAlarmDataSet()];

        this.subscriptions.push(
            this.onDataRRFFT.subscribe((newDataPoint: Array<ITuple<number, number>>) => {
                this.initializing = false;

                var fftRRData = Object.assign({}, this.fftRRDataSet[0]);
                fftRRData.data = newDataPoint.map((point: ITuple<number, number>) => ({ x: point.item1, y: point.item2 }));
                this.fftRRDataSet = [fftRRData];
            })
        );
    }
}
