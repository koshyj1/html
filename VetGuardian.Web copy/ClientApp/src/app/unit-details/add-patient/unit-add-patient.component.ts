import { Component, Input, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ApiService }  from 'src/services/api/api.service';
import { DataService } from 'src/services/data/data.service';
import { EnumService } from 'src/services/enum/enum.service';
import { IconService } from 'src/services/icon/icon.service';
import { TimeService } from 'src/services/time/time.service';
import { ToastrService, IndividualConfig } from 'ngx-toastr';

import { Unit, UnitStatusFlags } from 'src/models/unit';
import { Patient } from 'src/models/patient';
import { EnumMap } from 'src/models/enum-map';
import { Species } from 'src/models/species';
import { Staff, StaffType } from 'src/models/staff';
import { FormGroupCustom } from 'src/shared/form-group-custom';

import { IconDefinition } from '@fortawesome/pro-regular-svg-icons';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TemperatureUnit } from 'src/enums/temperature-unit';
import { WeightUnit } from 'src/enums/weight-unit';

@Component({
    selector: 'vg-add-patient',
    templateUrl: './unit-add-patient.component.html',
    styleUrls: [ './unit-add-patient.component.scss' ]
})
export class UnitAddPatientComponent {
    @ViewChild('editPatientModal') editPatientModal: BsModalRef;
    @ViewChild('newPatientModal') newPatientModal: BsModalRef;

    @Input() unitId: string;
    @Input() runId: string;
    @Input() patientId: string;

    public patient: Patient;

    public unitName: string;
    public petStatusIcon: IconDefinition;
    public petStatusColor: string;
    public petStatusText: string;
    public runTime: string;
    public circleIcon: IconDefinition;
    public addIcon: IconDefinition;
    public editIcon: IconDefinition;

    public videoEnabled: boolean;

    public sexes: EnumMap[];
    public species: Species[];

    private subscriptions: Subscription[] = [];
  
    public patients: Patient[];
    public selectedPatient: Patient;

    public weightUnits: EnumMap[] = [];
    public weightUnit: EnumMap;
    public temperatureUnits: EnumMap[] = [];
    public temperatureUnit: EnumMap;

    public attendingDoctors: Array<Staff> = [];
    public vetTechs: Array<Staff> = [];

    public form: FormGroupCustom = new FormGroupCustom({
        patientId: new FormControl(null, [
            Validators.required,
        ]),
        weight: new FormControl(null, [
            Validators.required,
            Validators.min(1),
            Validators.max(9999)
        ]),
        weightUnit: new FormControl(null, [
            Validators.required
        ]),
        warningTimer: new FormControl(null, [
            Validators.min(0),
            Validators.max(59999)
        ]),
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
        ]),
        temperature: new FormControl(null, [
          Validators.min(0),
          Validators.max(999)
        ]),
        heartrate: new FormControl(null, [
          Validators.min(0),
          Validators.max(999)
        ]),
        respirationrate: new FormControl(null, [
          Validators.min(0),
          Validators.max(999)
        ]),

        attendingDoctorId: new FormControl(null, [
            // Validators.required
        ]),
        vetTechId: new FormControl(null, [
            // Validators.required
        ])
    });

    public editPatientForm: FormGroupCustom = new FormGroupCustom({
        name: new FormControl(null, [
            Validators.required,
            Validators.maxLength(50)
        ]),
        ownerName: new FormControl(null, [
            Validators.required,
            Validators.maxLength(50)
        ]),
        birthDate: new FormControl(null, [
            Validators.required
        ]),
        sex: new FormControl(null, [ Validators.required ]),
        weight: new FormControl(null, [
            Validators.required,
            Validators.min(1),
            Validators.max(9999)
        ]),
        weightUnit: new FormControl(null, [
            Validators.required
        ]),
        species: new FormControl(null, [ Validators.required ]),
        breed: new FormControl(null, [
            Validators.required,
            Validators.maxLength(50)
        ]),
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

    public newPatientForm: FormGroupCustom = new FormGroupCustom({
        patientId: new FormControl(null, [
            Validators.required,
            Validators.maxLength(50)
        ]),
        name: new FormControl(null, [
            Validators.required,
            Validators.maxLength(50)
        ]),
        ownerName: new FormControl(null, [
            Validators.required,
            Validators.maxLength(50)
        ]),
        birthDate: new FormControl(null, [
            Validators.required
        ]),
        sex: new FormControl(null, [ Validators.required ]),
        weight: new FormControl(null, [ Validators.required, Validators.min(1) ]),
        species: new FormControl(null, [ Validators.required ]),
        breed: new FormControl(null, [
            Validators.required,
            Validators.maxLength(50)
        ]),
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
        private dataService: DataService,
        private enumService: EnumService,
        private iconService: IconService,
        private timeService: TimeService) { }

    async ngOnInit() {
        this.patient = new Patient(); 
        if(this.runId && this.patientId){
            var run = await this.apiService.getRun(this.runId);
            if(run){
                var patient = await this.apiService.getPatient(this.patientId);
                if(patient){
                    patient.heartRateLowAlarm = run.run.heartRateLowAlarm;
                    patient.heartRateLowWarning = run.run.heartRateLowWarning;
                    patient.heartRateHighAlarm = run.run.heartRateHighAlarm;
                    patient.heartRateHighWarning = run.run.heartRateHighWarning;
                    patient.respirationRateLowAlarm = run.run.respirationRateLowAlarm;
                    patient.respirationRateLowWarning = run.run.respirationRateLowWarning;
                    patient.respirationRateHighAlarm = run.run.respirationRateHighAlarm;
                    patient.respirationRateHighWarning = run.run.respirationRateHighWarning;
                    patient.warningTimer = run.run.warningTimer;

                    this.selectPatient(patient);
                    await this.apiService.updatePatient(this.selectedPatient.id, this.patient)
                        .then(async (response) => {
                        })
                        .catch((err: HttpErrorResponse) => {
                            this.editPatientForm.addErrors(err.error);
                        });
                }
            }
        }

        this.sexes = this.enumService.sexes;
        this.species = this.enumService.species;
        this.circleIcon = this.iconService.faCircleSolid;
        this.petStatusIcon = this.iconService.getPatientStatusIcon(null)[0];
        this.addIcon = this.iconService.faPlus;
        this.editIcon = this.iconService.faEdit;

        this.weightUnits = await this.apiService.getWeightsOptions();
        this.temperatureUnits = await this.apiService.getTemperaturesOptions();
        
        let vetSettings = await this.apiService.getVetSettings();

        this.weightUnit = this.weightUnits.find(unit => unit.id == vetSettings.defaultWeightUnit);
        this.temperatureUnit = this.temperatureUnits.find(unit => unit.id == vetSettings.defaultTemperatureUnit);
        
        // Defaults to vet settings value.
        this.form.patchValue({
            attendingDoctorId: vetSettings.defaultAttendingDoctorId,
            vetTechId: vetSettings.defaultVetTechId
        });

        // get the unit name
        this.apiService.getUnit(this.unitId)
            .then(unit => this.unitName = unit.name);

        await this.getPatients();
            
        // get doctors/vet tech and set defaults if defaults exist in vet settings.
        let staff = await this.apiService.getStaff();
        this.attendingDoctors = staff.filter(t => t.staffType == StaffType.AttendingDoctor);
        this.vetTechs =  staff.filter(t => t.staffType == StaffType.VetTech);

        // subscribe for the unit summary
        this.subscriptions.push(
            this.dataService.getOnUnitSummary().pipe(filter(t => t.unitId === this.unitId)).subscribe(t => {
                this.videoEnabled = UnitStatusFlags.CapturingVideo === (UnitStatusFlags.CapturingVideo & t.status);
                this.runTime = this.timeService.getRunTimeString(t.runTime);

                let petStatus = this.enumService.getPatientStatus(t.status);
                let petIcon = this.iconService.getPatientStatusIcon(petStatus);
                this.petStatusIcon = petIcon[0];
                this.petStatusColor = petIcon[1];
                this.petStatusText = this.enumService.getPatientStatusText(petStatus);
            })
        );
    }

    async getPatients(){
        this.patients = (await this.apiService.getPatients())
            .filter(t => !!t.patientId);
    }
    
    setNewWeightUnit(weightUnit: EnumMap){
        var isNewWeightUnit = this.weightUnit != weightUnit;
        this.weightUnit = weightUnit;

        var weight = this.newPatientForm.getFormControl('weight').value;
        if(weight != null && isNewWeightUnit){
            if(weightUnit.id == WeightUnit.Kilograms){
                weight = Number((weight / 2.2046).toFixed(3));
            } else {
                weight = Number((weight * 2.2046).toFixed(3));
            }

            this.newPatientForm.patchValue({
                weightUnit: weightUnit
            });
            this.newPatientForm.getFormControl('weight').setValue(weight);
        }
    }

    setWeightUnit(weightUnit: EnumMap){
        var isNewWeightUnit = this.weightUnit != weightUnit;
        this.weightUnit = weightUnit;

        var weight = this.form.getFormControl('weight').value;
        if(weight != null && isNewWeightUnit){
            if(this.weightUnit.id == WeightUnit.Kilograms){
                weight = Number((weight / 2.2046).toFixed(3));
            } else {
                weight = Number((weight * 2.2046).toFixed(3));
            }

            this.form.getFormControl('weight').setValue(weight);
            this.editPatientForm.patchValue({
                weightUnit: weightUnit
            });
            this.editPatientForm.getFormControl('weight').setValue(weight);
        }
    }

    setTempUnit(temperatureUnit: EnumMap){
        var isNewTemperatureUnit = this.temperatureUnit != temperatureUnit;
        this.temperatureUnit = temperatureUnit;

        var temperature = this.form.getFormControl('temperature').value;
        if(temperature != null && isNewTemperatureUnit){
            if(this.temperatureUnit.id == TemperatureUnit.Fahrenheit){
                temperature = Number(((temperature * (9/5)) + 32).toFixed(3));
            } else {
                temperature = Number(((temperature - 32) * (5/9)).toFixed(3));
            }
            this.form.getFormControl('temperature').setValue(temperature);
        }
    }

    selectPatient(patient: Patient) {
        this.selectedPatient = patient;
        this.weightUnit = this.weightUnits.find(unit => unit.id == patient.weightUnit);

        this.form.getFormControl('patientId').setValue(patient.patientId);

        this.form.getFormControl('weight').setValue(patient.weight);
        this.form.getFormControl('weightUnit').setValue(patient.weightUnit);
        this.form.getFormControl('warningTimer').setValue(patient.warningTimer);

        this.form.getFormControl('heartRateLowAlarm').setValue(patient.heartRateLowAlarm);
        this.form.getFormControl('heartRateLowWarning').setValue(patient.heartRateLowWarning);
        this.form.getFormControl('heartRateHighAlarm').setValue(patient.heartRateHighAlarm);
        this.form.getFormControl('heartRateHighWarning').setValue(patient.heartRateHighWarning);
        this.form.getFormControl('respirationRateLowAlarm').setValue(patient.respirationRateLowAlarm);
        this.form.getFormControl('respirationRateLowWarning').setValue(patient.respirationRateLowWarning);
        this.form.getFormControl('respirationRateHighAlarm').setValue(patient.respirationRateHighAlarm);
        this.form.getFormControl('respirationRateHighWarning').setValue(patient.respirationRateHighWarning);

        this.editPatientForm.getFormControl('heartRateLowAlarm').setValue(patient.heartRateLowAlarm);
        this.editPatientForm.getFormControl('heartRateLowWarning').setValue(patient.heartRateLowWarning);
        this.editPatientForm.getFormControl('heartRateHighAlarm').setValue(patient.heartRateHighAlarm);
        this.editPatientForm.getFormControl('heartRateHighWarning').setValue(patient.heartRateHighWarning);
        this.editPatientForm.getFormControl('respirationRateLowAlarm').setValue(patient.respirationRateLowAlarm);
        this.editPatientForm.getFormControl('respirationRateLowWarning').setValue(patient.respirationRateLowWarning);
        this.editPatientForm.getFormControl('respirationRateHighAlarm').setValue(patient.respirationRateHighAlarm);
        this.editPatientForm.getFormControl('respirationRateHighWarning').setValue(patient.respirationRateHighWarning);

        this.editPatientForm.getFormControl('name').setValue(patient.name);
        this.editPatientForm.getFormControl('ownerName').setValue(patient.ownerName);
        this.editPatientForm.getFormControl('birthDate').setValue((new Date(patient.birthDate)).toISOString().substring(0, 10));
        this.editPatientForm.getFormControl('sex').setValue(patient.sex);
        this.editPatientForm.getFormControl('weight').setValue(patient.weight);
        this.editPatientForm.getFormControl('weightUnit').setValue(patient.weightUnit);
        this.editPatientForm.getFormControl('species').setValue(patient.species);
        this.editPatientForm.getFormControl('breed').setValue(patient.breed);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(t => t.unsubscribe());
    }

    onPatientIdBlur() {
      this.form.getFormControl('patientId').setValue(this.selectedPatient ? this.selectedPatient.patientId : '');
    }

    fillSpeciesDefaults(e: Event, form: FormGroupCustom) {
        let id = parseInt(form.getFormControl('species').value);
        let species = this.species.find(t => t.id === id);
        if (species) {
            form.getFormControl('heartRateLowAlarm').setValue(species.defaultHeartRateLowAlarm);
            form.getFormControl('heartRateLowWarning').setValue(species.defaultHeartRateLowWarning);
            form.getFormControl('heartRateHighAlarm').setValue(species.defaultHeartRateHighAlarm);
            form.getFormControl('heartRateHighWarning').setValue(species.defaultHeartRateHighWarning);
            form.getFormControl('respirationRateLowAlarm').setValue(species.defaultRespirationRateLowAlarm);
            form.getFormControl('respirationRateLowWarning').setValue(species.defaultRespirationRateLowWarning);
            form.getFormControl('respirationRateHighAlarm').setValue(species.defaultRespirationRateHighAlarm);
            form.getFormControl('respirationRateHighWarning').setValue(species.defaultRespirationRateHighWarning);
            if (species.id == 9) {
               form.getFormControl('breed').setValue('Man');
               form.getFormControl('sex').setValue(1);
               form.getFormControl('name').setValue('Vik');
               form.getFormControl('ownerName').setValue('Vik');
            }
        }
    }

    async onEditPatientSubmit() {
        this.editPatientForm.submitted = true;

        await this.apiService.updatePatient(this.selectedPatient.id, {
            name: this.editPatientForm.value.name,
            ownerName: this.editPatientForm.value.ownerName,
            species: this.editPatientForm.value.species,
            breed: this.editPatientForm.value.breed,
            age: this.editPatientForm.value.age,
            birthDate: this.editPatientForm.value.birthDate,
            weight: this.editPatientForm.value.weight,
            sex: this.editPatientForm.value.sex,
            heartRateLowAlarm: this.editPatientForm.value.heartRateLowAlarm,
            heartRateLowWarning: this.editPatientForm.value.heartRateLowWarning,
            heartRateHighAlarm: this.editPatientForm.value.heartRateHighAlarm,
            heartRateHighWarning: this.editPatientForm.value.heartRateHighWarning,
            respirationRateLowAlarm: this.editPatientForm.value.respirationRateLowAlarm,
            respirationRateLowWarning: this.editPatientForm.value.respirationRateLowWarning,
            respirationRateHighAlarm: this.editPatientForm.value.respirationRateHighAlarm,
            respirationRateHighWarning: this.editPatientForm.value.respirationRateHighWarning,
            warningTimer: this.editPatientForm.value.warningTimer,
            patientId: this.selectedPatient.patientId,

            weightUnit: this.weightUnit.id,
            temperatureUnit: this.temperatureUnit.id,
        })
            .then(async (response) => {
                this.selectPatient(response);
                await this.getPatients();
                this.editPatientModal.hide();
            })
            .catch((err: HttpErrorResponse) => {
                this.editPatientForm.addErrors(err.error);
            });
    }

    async onNewPatientSubmit() {
        this.newPatientForm.submitted = true;

        // Uses default vet settings
        let vetSettings = await this.apiService.getVetSettings();

        await this.apiService.createPatient({
            name: this.newPatientForm.value.name,
            ownerName: this.newPatientForm.value.ownerName,
            species: this.newPatientForm.value.species,
            breed: this.newPatientForm.value.breed,
            age: 0, // OBSELETE
            birthDate: this.newPatientForm.value.birthDate,
            weight: this.newPatientForm.value.weight,
            sex: this.newPatientForm.value.sex,
            heartRateLowAlarm: this.newPatientForm.value.heartRateLowAlarm,
            heartRateLowWarning: this.newPatientForm.value.heartRateLowWarning,
            heartRateHighAlarm: this.newPatientForm.value.heartRateHighAlarm,
            heartRateHighWarning: this.newPatientForm.value.heartRateHighWarning,
            respirationRateLowAlarm: this.newPatientForm.value.respirationRateLowAlarm,
            respirationRateLowWarning: this.newPatientForm.value.respirationRateLowWarning,
            respirationRateHighAlarm: this.newPatientForm.value.respirationRateHighAlarm,
            respirationRateHighWarning: this.newPatientForm.value.respirationRateHighWarning,
            warningTimer: this.newPatientForm.value.warningTimer,
            patientId: this.newPatientForm.value.patientId,

            weightUnit: this.weightUnit.id,
            temperatureUnit: vetSettings.defaultTemperatureUnit,    //Defaults to global settings.
        })
            .then(async (response) => {
                this.selectPatient(response);
                await this.getPatients();
                this.newPatientModal.hide();
            })
            .catch((err: HttpErrorResponse) => {
                this.newPatientForm.addErrors(err.error);
            });
    }

    async onSubmit() {
        this.form.submitted = true;

        var patient = Object.assign({}, this.selectedPatient);
        patient.warningTimer = this.form.value.warningTimer;
        patient.weight = this.form.value.weight ? this.form.value.weight : patient.weight;
        patient.weightUnit = this.weightUnit ? this.weightUnit.id : patient.weightUnit;
        patient.temperatureUnit = this.temperatureUnit ? this.temperatureUnit.id : patient.temperatureUnit;
        patient = await this.apiService.updatePatient(this.selectedPatient.id, patient);

        await this.apiService.startDataAcquisition(
            this.unitId, 
            this.selectedPatient.id, 
            this.form.getFormControl('temperature').value, 
            this.form.getFormControl('heartrate').value, 
            this.form.getFormControl('respirationrate').value,
            this.form.getFormControl('weight').value,
            this.weightUnit.id,
            this.temperatureUnit.id,
            this.form.getFormControl('attendingDoctorId').value, 
            this.form.getFormControl('vetTechId').value
        );
    }
}
