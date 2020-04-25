import { Component, Input, EventEmitter, Output } from '@angular/core';

import { TimeService } from 'src/services/time/time.service';
import { IconService } from 'src/services/icon/icon.service';
import { EnumService } from 'src/services/enum/enum.service';

import { UnitStatusFlags } from 'src/models/unit';
import { Patient } from 'src/models/patient';
import { IconDefinition } from '@fortawesome/pro-solid-svg-icons';

@Component({
    selector: 'vg-unit-status-bar',
    templateUrl: './unit-status-bar.component.html',
    styleUrls: [ './unit-status-bar.component.scss' ]
})
export class UnitStatusBarComponent {
    @Input() runTime: number;
    @Input() unitName: string;

    private _unitStatus: number;
    @Input() set unitStatus(value: number) {
        this._unitStatus = value;
        let patientStatus = this.enumService.getPatientStatus(value);
        let patientIconInfo = this.iconService.getPatientStatusIcon(patientStatus);
        this.patientStatusIcon = patientIconInfo[0];
        this.patientStatusColor = patientIconInfo[1];
        this.patientStatusText = this.enumService.getPatientStatusText(patientStatus);
    }

    private _patient: Patient;
    @Input() set patient(value: Patient) {
        this._patient = value;
        this.patientName = value ? value.name : null;
        this.ownerName = value ? value.ownerName : null;
        this.sex = value ? value.sex : null;
        this.patientId = value ? value.patientId : null;
        this.speciesName = this.enumService.getSpeciesName(value ? value.species : null);
        this.speciesIcon = this.iconService.getSpeciesIcon(value ? value.species : null);
        this.sexInitials = this.enumService.getSexInitialism(value ? value.sex : null);
    }

    public get isAlarmAcknowledged(): boolean {
        return ((this._unitStatus & UnitStatusFlags.AlarmAcknowledged) == UnitStatusFlags.AlarmAcknowledged);
    }
    public get isAlarm(): boolean {
        return ((this._unitStatus & UnitStatusFlags.Alarm) == UnitStatusFlags.Alarm);
    }
    public get isOccupied(): boolean {
        return (UnitStatusFlags.Occupied === (UnitStatusFlags.Occupied & this._unitStatus));
    }
    public get isAcquiring(): boolean {
        return (UnitStatusFlags.AcquiringData === (UnitStatusFlags.AcquiringData & this._unitStatus));
    }
    public get sensorError(): boolean {
        return (UnitStatusFlags.SensorError === (UnitStatusFlags.SensorError & this._unitStatus));
    }
    public get cameraError(): boolean {
        return (UnitStatusFlags.CameraError === (UnitStatusFlags.CameraError & this._unitStatus));
    }
    public get runTimeString(): string {
        return this.runTime == null ? null : this.timeService.getRunTimeString(this.runTime);
    }
    public get isPaused(): boolean {
        return (UnitStatusFlags.Paused === (UnitStatusFlags.Paused & this._unitStatus));
    }

    public patientName: string;
    public ownerName: string;
    public speciesName: string;
    public speciesIcon: IconDefinition;
    public sex: number;
    public sexInitials: string;
    public patientStatusIcon: IconDefinition;
    public patientStatusColor: string;
    public patientStatusText: string;
    public patientId: string;

    @Output() public acknowledgeAlarm = new EventEmitter<null>();

    constructor(
        private timeService: TimeService,
        private iconService: IconService,
        private enumService: EnumService) {}
        
    onAcknowledgeAlarm(){
        this.acknowledgeAlarm.emit();
    }

    ngOnInit() {
        this.speciesIcon = this.iconService.getSpeciesIcon(null);
        this.sexInitials = this.enumService.getSexInitialism(null);
    }
}
