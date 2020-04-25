import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FormGroupCustom } from 'src/shared/form-group-custom';

import { Staff } from 'src/models/staff';
import { ApiService } from 'src/services/api/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { BsModalRef } from 'ngx-bootstrap';
import { IconDefinition } from '@fortawesome/pro-solid-svg-icons';
import { EnumMap } from 'src/models/enum-map';
import { IconService } from 'src/services/icon/icon.service';
import { EnumService } from 'src/services/enum/enum.service';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss']
})
export class StaffComponent implements OnInit {
  @ViewChild('editStaffModal') editStaffModal: BsModalRef;
  @ViewChild('newStaffModal') newStaffModal: BsModalRef;
  @ViewChild('deleteStaffModal') deleteStaffModal: BsModalRef;

  public staff: Array<Staff> = [];
  public staffTypes: EnumMap[] = [];
  public selectedStaff: Staff;
  
  public deleteError: string = "";
  public addIcon: IconDefinition;
  public editIcon: IconDefinition;
  public deleteIcon: IconDefinition;

  public newStaffForm: FormGroupCustom = new FormGroupCustom({
    firstName: new FormControl(null, [
        Validators.required,
        Validators.maxLength(50)
    ]),
    lastName: new FormControl(null, [
        Validators.required,
        Validators.maxLength(50)
    ]),
    staffType: new FormControl(null, [
        Validators.required
    ])
  });
  
  public editStaffForm: FormGroupCustom = new FormGroupCustom({
    firstName: new FormControl(null, [
        Validators.required,
        Validators.maxLength(50)
    ]),
    lastName: new FormControl(null, [
        Validators.required,
        Validators.maxLength(50)
    ]),
    staffType: new FormControl(null, [
        Validators.required
    ])
  });

  constructor(private apiService: ApiService, private iconService: IconService, private enumService: EnumService) { }

  async ngOnInit() {
    await this.getStaff();
    this.staffTypes = await this.apiService.getStaffTypeOptions();

    this.addIcon = this.iconService.faPlus;
    this.editIcon = this.iconService.faEdit;
    this.deleteIcon = this.iconService.faCircleMinus;
  }

  async getStaff(){
    this.staff = await this.apiService.getStaff();
  }

  getStaffTypeText(type: number): string{
    return this.enumService.getStaffText(type);
  }
  
  onSelectStaff(staff: Staff) {
    this.selectedStaff = staff;

    this.editStaffForm.getFormControl('firstName').setValue(staff.firstName);
    this.editStaffForm.getFormControl('lastName').setValue(staff.lastName);
    this.editStaffForm.getFormControl('staffType').setValue(staff.staffType);
  }

  async onEditStaffSubmit() {
    this.editStaffForm.submitted = true;
    let staff = Object.assign({}, this.editStaffForm.value) as Staff;

    await this.apiService.updateStaff(this.selectedStaff.id, staff)
        .then(async (response) => {
            this.selectedStaff = null;
            await this.getStaff();
            this.editStaffModal.hide();
        })
        .catch((err: HttpErrorResponse) => {
            this.editStaffForm.addErrors(err.error);
        });
  }

  async onNewStaffSubmit() {
      this.newStaffForm.submitted = true;
      let staff = Object.assign({}, this.newStaffForm.value) as Staff;

      await this.apiService.createStaff(staff)
          .then(async (response) => {
              await this.getStaff();
              this.newStaffModal.hide();
          })
          .catch((err: HttpErrorResponse) => {
              this.newStaffForm.addErrors(err.error);
          });
  }

  async onDeleteStaff() {
    var staff = this.selectedStaff;
    this.deleteError = "";

    await this.apiService.deleteStaff(staff.id)
        .then(async (response) => {
            await this.getStaff();
            this.selectedStaff = null;
            this.deleteError = "";
            this.deleteStaffModal.hide();
        })
        .catch((err: HttpErrorResponse) => {
          this.deleteError = err.error;
        });
  }
}
