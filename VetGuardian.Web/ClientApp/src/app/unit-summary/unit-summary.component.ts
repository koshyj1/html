import { Component, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { DataService } from '../../services/data/data.service';
import { IconService } from 'src/services/icon/icon.service';

import { UnitStatusFlags } from 'src/models/unit';

import * as proLight from '@fortawesome/pro-light-svg-icons';
import { IconDefinition } from '@fortawesome/pro-regular-svg-icons';
import { EnumService } from 'src/services/enum/enum.service';

@Component({
    selector: 'vg-unit-summary',
    templateUrl: './unit-summary.component.html',
    styleUrls: [ './unit-summary.component.scss' ]
})
export class UnitSummaryComponent {
    private _id: string;
    @Input() public set id(value: string) {
        this._id = value;
    }
    public get id() { let x = this._id; return x; }

    @Output() public show: EventEmitter<string> = new EventEmitter();

    public inUse: boolean;
    public unitStatus: number;
    public heartRate: number;
    public respirationRate: number;
    public petName: string;
    public sex: number;
    public sexInitials: string;
    public petStatusIcon: IconDefinition;
    public speciesIcon: IconDefinition;
    public videoIcon: IconDefinition;

    public petStatusColor: string;

    public faPlusSquare: IconDefinition = proLight.faPlusSquare;
    public errorIcon: IconDefinition = this.iconService.getErrorIcon();

    public get isOccupied() { return UnitStatusFlags.Occupied === (UnitStatusFlags.Occupied & this.unitStatus); }
    public get hasStatus() { return this.unitStatus != null; }
    public get hasErrors() {
        return (UnitStatusFlags.SensorError === (UnitStatusFlags.SensorError & this.unitStatus)) ||
               (UnitStatusFlags.CameraError === (UnitStatusFlags.CameraError & this.unitStatus));
    }

    @HostBinding('class.card') isCard: boolean = true;
    @HostBinding('class.empty') get isEmpty() { return this.hasStatus && !this.isOccupied; }
    @HostBinding('class.configure') get needsConfigured() { return !this.hasStatus; }
    @HostBinding('class.has-movement') get hasMovement() { return UnitStatusFlags.MotionDetected === (UnitStatusFlags.MotionDetected & this.unitStatus); }

    private subscriptions: Subscription[] = [];

    constructor(
        private router: Router,
        private dataService: DataService,
        private enumService: EnumService,
        private iconService: IconService) {}

    ngAfterViewInit() {
        // subscribe to incoming data from the unit
        this.subscriptions.push(
            this.dataService.getOnLiveData().pipe(filter(t => t.unitId === this._id)).subscribe(t => {
                this.heartRate = t.heartRate;
                this.respirationRate = t.respirationRate;
            })
        );
        // subscribe to state changes for the unit
        this.subscriptions.push(
            this.dataService.getOnUnitSummary().pipe(filter(t => t.unitId === this._id)).subscribe(t => {
                this.inUse = t.inUse;
                this.unitStatus = t.status;
                if (t.currentPatient) {
                    this.petName = t.currentPatient.name;
                    this.speciesIcon = this.iconService.getSpeciesIcon(t.currentPatient.species);
                    this.sex = t.currentPatient.sex;
                    this.sexInitials = this.enumService.getSexInitialism(t.currentPatient.sex);
                } else {
                    this.petName = null;
                    this.speciesIcon = this.iconService.getSpeciesIcon(null);
                    this.sex = null;
                    this.sexInitials = this.enumService.getSexInitialism(null);
                }
                this.videoIcon = this.iconService.getVideoIcon(UnitStatusFlags.CapturingVideo === (UnitStatusFlags.CapturingVideo & this.unitStatus));
                let petStatus = this.enumService.getPatientStatus(t.status);
                let petIcon = this.iconService.getPatientStatusIcon(petStatus);
                this.petStatusIcon = petIcon[0];
                this.petStatusColor = petIcon[1];
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    onCardClick(e: MouseEvent) {
        e.stopPropagation();
        this.show.emit(this.id);
        this.router.navigateByUrl('/home');
    }
}