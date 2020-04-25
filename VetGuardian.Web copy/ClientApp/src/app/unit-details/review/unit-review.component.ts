import { Component, Input, ViewChild, HostListener } from '@angular/core';

import { RunLogComponent } from 'src/app/run-log/run-log.component';

import { Patient } from 'src/models/patient';

import { DataService } from 'src/services/data/data.service';
import { ApiService } from 'src/services/api/api.service';
import { EnumService } from 'src/services/enum/enum.service';

@Component({
    selector: 'vg-unit-review',
    templateUrl: './unit-review.component.html',
    styleUrls: [ './unit-review.component.scss' ]
})
export class UnitReviewComponent {
    @ViewChild('runLog') runLog: RunLogComponent

    private _unitId: string;
    @Input() public set unitId(value) {
        this._unitId = value;
        this.getUnitInfo();
    }
    public get unitId() { let x = this._unitId; return x; }

    public runId: string;
    public logsMaxHeight: number;

    public unitName: string;
    public breed: string;
    public birthDate: Date;
    public weight: number;
    public weightUnit: string;
    public temperatureUnit: string;
    public runTime: number;
    public unitStatus: number;
    public patient: Patient;

    constructor(
        private apiService: ApiService,
        private enumService: EnumService,
        private dataService: DataService) {}

    ngOnInit() {
        window.addEventListener('resize', this.onResize);
    }

    ngAfterViewInit() {
        this.onResize();
    }

    ngOnDestroy() {
        window.removeEventListener('resize', this.onResize);
    }

    @HostListener('window:resize', ['$event'])
    private onResize(event?: any) {
        const page = document.getElementsByClassName('router-wrapper')[0];
        const pageHeight = page.clientHeight;

        const statusBar = document.getElementsByClassName('status-bar')[0];
        const statusBarHeight = statusBar.clientHeight;
        
        const offset = 67;
        setTimeout(() => this.logsMaxHeight = (pageHeight - statusBarHeight - offset));
    };

    private async getUnitInfo(): Promise<void> {
        if (this._unitId) {
            let unit = await this.apiService.getUnit(this._unitId);
            this.unitName = unit.name;
        } else {
            this.unitName = null;
        }

        if (this._unitId) {
            // fetch the unit summary for this unit
            // because this unit is now "off", there will not be any new unit summaries to subscribe to
            let t = (await this.apiService.getUnitSummaries()).find(t => t.unitId === this._unitId);
            this.runId = t.currentRun && t.currentRun.id;
            if (t.currentPatient) {
                this.breed = t.currentPatient.breed;
                this.birthDate = t.currentPatient.birthDate;
                this.weight = t.currentPatient.weight;
                this.weightUnit = this.enumService.getWeightUnitInitials(t.currentPatient.weightUnit);
                this.temperatureUnit = this.enumService.getTemperatureUnitInitials(t.currentPatient.temperatureUnit);
            } else {
                this.breed = null;
                this.birthDate = null;
                this.weight = null;
                this.weightUnit = null;
                this.temperatureUnit = null;
            }
            this.runTime = t.runTime;
            this.unitStatus = t.status;
            this.patient = t.currentPatient;
        }
    }

    public async clearUnit(): Promise<void> {
        this.dataService.clearData(this._unitId);
        await this.apiService.clearUnit(this._unitId);
    }

}