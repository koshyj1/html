import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { FormGroupCustom } from 'src/shared/form-group-custom';
import { ApiService } from 'src/services/api/api.service';
import { VetSettings } from 'src/models/vet-settings';
import { EnumMap } from 'src/models/enum-map';
import { Staff, StaffType } from 'src/models/staff';
import { DataService } from '../../services/data/data.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
    public loading: boolean = true;
    public submitting: boolean = false;
    public selectedFile: File;
    public url: string = 'http://placehold.it/0';
    public uploading = false;
    public get disableInput() { return this.loading || this.submitting; }
    public imageTs = (new Date()).getTime();

    public weightUnits: EnumMap[] = [];
    public temperatureUnits: EnumMap[] = [];
    public attendingDoctors: Array<Staff> = [];
    public vetTechs: Array<Staff> = [];

    public form: FormGroupCustom = new FormGroupCustom({
        name: new FormControl(null),
        address: new FormControl(null),
        city: new FormControl(null),
        state: new FormControl(null),
        zipCode: new FormControl(null),
        phoneNumber: new FormControl(null),
        email: new FormControl(null),
        defaultWeightUnit: new FormControl(null),
        defaultTemperatureUnit: new FormControl(null),
        defaultAttendingDoctorId: new FormControl(null),
        defaultVetTechId: new FormControl(null)
    });

    constructor(private apiService: ApiService, private dataService: DataService) { }

    async ngOnInit() {
        this.weightUnits = await this.apiService.getWeightsOptions();
        this.temperatureUnits = await this.apiService.getTemperaturesOptions();

        var staff = await this.apiService.getStaff();
        this.attendingDoctors = staff.filter(t => t.staffType == StaffType.AttendingDoctor);
        this.vetTechs = staff.filter(t => t.staffType == StaffType.VetTech);

        let vetSettings = await this.apiService.getVetSettings();
        this.form.setValue(vetSettings);
        this.loading = false;

        this.form.patchValue({
            defaultWeightUnit: vetSettings.defaultWeightUnit.toString(),
            defaultTemperatureUnit: vetSettings.defaultTemperatureUnit.toString(),
        });
    }

    async onSubmit() {
        this.submitting = true;
        this.form.submitted = true;
        this.apiService.updateVetSettings(this.form.value as VetSettings)
            .then(() => {
                this.submitting = false;
                this.dataService.vetSettings.next(this.form.value as VetSettings);
            })
            .catch((err: HttpErrorResponse) => {
                this.form.addErrors(err.error);
                this.submitting = false;
            });
    }

    onFileChanged(event: any) {
        this.selectedFile = event.target.files[0]; //do not remove.
    }

    readURL(event:any) {
        if (event.target.files && event.target.files[0]) {
          var reader = new FileReader();
      
          reader.onload = (event:any) => {
           this.url = event.target.result;
          }
      
          reader.readAsDataURL(event.target.files[0]);
        }
      }

    async onUpload() {
        this.uploading = true;
        console.log("here");
        await this.apiService.updateVetLogo(this.selectedFile)
            .then(() => {
                console.log("greenlight");
                this.uploading = false;
                this.imageTs = (new Date()).getTime();
            })
            .catch(() => {
                console.log("fail");
                this.uploading = false;
            });
    }

    // imageToShow: any;
    // isImageLoading: boolean;

    // createImageFromBlob(image: Blob) {
    //     console.log("here")
    //     let reader = new FileReader();
    //     reader.addEventListener("load", () => {
    //         this.imageToShow = reader.result;
    //     }, false);

    //     if (image) {
    //         reader.readAsDataURL(image);
    //     }
    // }


    // getImageFromService() {
    //     this.isImageLoading = true;
    //     this.apiService.getImage(this.selectedFile).subscribe(data => {
    //       this.createImageFromBlob(data);
    //       this.isImageLoading = false;
    //     }, error => {
    //       this.isImageLoading = false;
    //       console.log(error);
    //     });
    // }

//   public imagePath;
//   imgURL: Blob;
 
//   preview(files) {
//     var reader = new FileReader();
//     this.imagePath = files;
//     reader.readAsDataURL(files); 
//     reader.onload = (_event) => { 
//       this.imgURL = reader.result; 
//     }
//   }
}
