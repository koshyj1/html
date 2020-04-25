import { Component, Input, ElementRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DataService } from '../../services/data/data.service';

import { FormGroupCustom } from 'src/shared/form-group-custom';
import { ApiService } from 'src/services/api/api.service';
import { Unit } from 'src/models/unit';

@Component({
    selector: 'vg-unit-configuration',
    templateUrl: './unit-configuration.component.html',
    styleUrls: [ './unit-configuration.component.scss' ]
})
export class UnitConfigurationComponent {

    public unitId: string;
    public loading: boolean = true;
    public submitting: boolean = false;
    public readonly showSimulateDataToggle: boolean = false;

    public get disableInput() { return this.loading || this.submitting; }

    public form: FormGroupCustom = new FormGroupCustom({
        id: new FormControl(null, [
            Validators.required
        ]),
        name: new FormControl(null, [
            Validators.required,
            Validators.maxLength(50)
        ]),
        cameraHostname: new FormControl(null, [
            Validators.required,
            Validators.maxLength(50)
        ]),
        cameraUsername: new FormControl(null, [
            Validators.required,
            Validators.maxLength(50)
        ]),
        cameraPassword: new FormControl(null, [
            Validators.required,
            Validators.maxLength(50)
        ]),
        serialNumber: new FormControl(null, [
            Validators.required,
            Validators.min(0),
            Validators.max(2147483647)
        ]),
        sensorIpAddress: new FormControl(null, [
            Validators.required,
            Validators.maxLength(15),
            Validators.pattern(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
        ]),
        simulate: new FormControl(false, [
            Validators.required
        ])
   });

    private subscriptions: Subscription[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private apiService: ApiService,
        private dataService: DataService) {}

    async ngOnInit() {
        let subscription = this.route.params.subscribe(async params => {
            if(params['serialNumber']) {
                // adding a new unit
                this.unitId = ''; // just need to make it non-null
                this.form.getFormControl('serialNumber').setValue(params['serialNumber']);
                this.form.getFormControl('sensorIpAddress').setValue(params['ipAddress']);
                this.form.getFormControl('simulate').setValue(params['simulate'] != null ? params['simulate'] : false);
            } else if (params['id']) {
                // editing an existing unit
                this.unitId = params['id'] as string;
                let unit = await this.apiService.getUnit(this.unitId);
                this.form.getFormControl('id').setValue(unit.id);
                this.form.getFormControl('name').setValue(unit.name);
                this.form.getFormControl('cameraHostname').setValue(unit.cameraHostname);
                this.form.getFormControl('cameraUsername').setValue(unit.cameraUsername);
                this.form.getFormControl('cameraPassword').setValue(unit.cameraPassword);
                this.form.getFormControl('serialNumber').setValue(unit.serialNumber);
                this.form.getFormControl('sensorIpAddress').setValue(unit.sensorIpAddress);
                this.form.getFormControl('simulate').setValue(unit.simulate);
            }
            this.loading = false;
            setTimeout(() => subscription.unsubscribe());
        });
    }

    ngAfterViewInit() {
        if (this.unitId === null || this.unitId === undefined) {
            this.router.navigateByUrl('/home');
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(t => t.unsubscribe());
    }

    async onSubmit() {
        this.submitting = true;
        this.form.submitted = true;
        if (this.unitId) {
            this.apiService.updateUnit(this.form.value as Unit)
                .then(() => {
                    this.dataService.activeUnitId.next(this.unitId);
                    this.router.navigateByUrl('/home');
                })
                .catch((err: HttpErrorResponse) => {
                    this.form.addErrors(err.error);
                    this.submitting = false;
                });
        } else {
            this.apiService.createUnit(this.form.value as Unit)
                .then((unitId) => {
                    this.dataService.activeUnitId.next(unitId);
                    this.router.navigateByUrl('/home');
                })
                .catch((err: HttpErrorResponse) => {
                    this.form.addErrors(err.error);
                    this.submitting = false;
                });
        }
    }

    public deleteUnit() {
        if (confirm("Delete this unit? This action cannot be undone.")) {
            this.apiService.deleteUnit(this.form.getFormControl('id').value)
                .then(() => this.router.navigateByUrl('/home'))
                .catch((err: HttpErrorResponse) => console.error(err));
        }
    }
}
