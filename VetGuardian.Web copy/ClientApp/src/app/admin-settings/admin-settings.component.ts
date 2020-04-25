import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { FormGroupCustom } from 'src/shared/form-group-custom';
import { ApiService } from 'src/services/api/api.service';
import { FTPSettings, FFTSettings, AdminSettings, CloudSettings, ChartingSettings, BodyDetectionSettings } from 'src/models/admin-settings';
import { EnumMap } from 'src/models/enum-map';
import { DetectionType } from 'src/enums/detection-type';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss']
})
export class AdminSettingsComponent implements OnInit {
  public loading: boolean = true;
  public submitting: boolean = false;

  public detectionTypes: EnumMap[] = [];
  public detectionType?: EnumMap;
  public detectionTypeDisabled: boolean;

  public form: FormGroupCustom = new FormGroupCustom({
    // Charting Settings
    enableAlarm: new FormControl(true, [
      Validators.required
    ]),

    // FTP Settings
    enabled: new FormControl(false, [
      Validators.required
    ]),
    hostname: new FormControl(null, [
      Validators.required
    ]),
    userName: new FormControl(null, [
      Validators.required
    ]),
    password: new FormControl(null, [
      Validators.required
    ]),
    rootPath: new FormControl(null, [
      Validators.required
    ]),

    // FFT Settings
    motionThreshold: new FormControl(null, [
      Validators.required
    ]),
    motionDelay: new FormControl(null, [
      Validators.required
    ]),
    hrMagnitude: new FormControl(null, [
      Validators.required
    ]),
    sampleSize: new FormControl(null, [
      Validators.required
    ]),
    sampleRate: new FormControl(null, [
      Validators.required
    ]),
    sampleSizeRR: new FormControl(null, [
      Validators.required
    ]),
    presenceSampleSize: new FormControl(null, [
      Validators.required
    ]),
    presenceSampleRate: new FormControl(null, [
      Validators.required
    ]),
    displayAverageSeconds: new FormControl(null, [
      Validators.required
    ]),
    displayAverageSecondsRR: new FormControl(null, [
      Validators.required
    ]),

    // Body Detection Settings
    enableBodyDetect: new FormControl(false, [
      Validators.required
    ]),
    presenceDetectCount: new FormControl(null, [
      Validators.required
    ]),

    // Cloud Settings
    cloudEnabled: new FormControl(false, [
      Validators.required
    ]),
    runDataCloudEndpoint: new FormControl(null, [
      Validators.required
    ])
  });

  constructor(private apiService: ApiService) { }

  async ngOnInit() {
    this.detectionTypes = await this.apiService.getDetectionTypes();

    let adminSettings = await this.apiService.getAdminSettings();
    this.setChartingSettings(adminSettings.chartingSettings);
    this.setFTPSettings(adminSettings.ftpSettings);
    this.setFFTSettings(adminSettings.fftSettings);
    this.setBodyDetectionSettings(adminSettings.bodyDetectionSettings);
    this.setCloudSettings(adminSettings.cloudSettings);
  }

  setChartingSettings(settings: ChartingSettings) {
    this.form.patchValue({
      enableAlarm: settings.enableAlarm,
    });
  }

  setFTPSettings(settings: FTPSettings): void {
    this.form.patchValue({
      enabled: settings.enabled,
      hostname: settings.hostname,
      userName: settings.userName,
      password: settings.password,
      rootPath: settings.rootPath
    });
  }

  setFFTSettings(settings: FFTSettings): void {
    this.form.patchValue({
      motionThreshold: settings.motionThreshold,
      motionDelay: settings.motionDelay,
      hrMagnitude: settings.hrMagnitude,
      sampleSize: settings.sampleSize,
      sampleRate: settings.sampleRate,
      sampleSizeRR: settings.sampleSizeRR,
      presenceSampleSize: settings.presenceSampleSize,
      presenceSampleRate: settings.presenceSampleRate,
      displayAverageSeconds: settings.displayAverageSeconds,
      displayAverageSecondsRR: settings.displayAverageSecondsRR
    });
  }

  setBodyDetectionSettings(settings: BodyDetectionSettings): void {
    this.detectionTypeDisabled = !settings.enableBodyDetect;
    if(settings.detectionType){
      this.detectionType = this.detectionTypes.filter(type => type.id == settings.detectionType)[0];
    }

    this.form.patchValue({
      enableBodyDetect: settings.enableBodyDetect,
      presenceDetectCount: settings.presenceDetectCount
    });
  }

  setCloudSettings(settings: CloudSettings): void {
    this.form.patchValue({
      cloudEnabled: settings.enabled,
      runDataCloudEndpoint: settings.runDataCloudEndpoint
    });
  }

  onToggleBodyDetection(){
    this.detectionTypeDisabled = !this.detectionTypeDisabled;
  }

  onSetDetectionType(type: EnumMap){
    if(!this.detectionTypeDisabled){
        this.detectionType = type;

        if(this.detectionType.id == DetectionType.FFTMethod){
          this.form.getFormControl('hrMagnitude').setValue(0.2);
          this.form.getFormControl('presenceDetectCount').setValue(3);
        } else {
          this.form.getFormControl('hrMagnitude').setValue(1);
          this.form.getFormControl('presenceDetectCount').setValue(2);
        }
    }
  }

  async onSubmit(): Promise<void> {
    this.submitting = true;
    this.form.submitted = true;

    this.apiService.updateAdminSettings(this.getAdminSettings())
      .then(() => {
        this.submitting = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.form.addErrors(err.error);
        this.submitting = false;
      });
  }

  getAdminSettings(): AdminSettings {
    return {
      chartingSettings: this.getChartingSettings(),
      ftpSettings: this.getFTPSettings(),
      fftSettings: this.getFFTSettings(),
      bodyDetectionSettings: this.getBodyDetectionSettings(),
      cloudSettings: this.getCloudSettings()
    };
  }

  getChartingSettings(): ChartingSettings {
    return {
      enableAlarm: this.form.get("enableAlarm").value
    };
  }

  getFTPSettings(): FTPSettings {
    return {
      enabled: this.form.get("enabled").value,
      hostname: this.form.get("hostname").value,
      userName: this.form.get("userName").value,
      password: this.form.get("password").value,
      rootPath: this.form.get("rootPath").value
    };
  }

  getFFTSettings(): FFTSettings {
    return {
      motionThreshold: this.form.get("motionThreshold").value,
      motionDelay: this.form.get("motionDelay").value,
      hrMagnitude: this.form.get("hrMagnitude").value,
      sampleSize: this.form.get("sampleSize").value,
      sampleRate: this.form.get("sampleRate").value,
      sampleSizeRR: this.form.get("sampleSizeRR").value,
      presenceSampleSize: this.form.get("presenceSampleSize").value,
      presenceSampleRate: this.form.get("presenceSampleRate").value,
      displayAverageSeconds: this.form.get("displayAverageSeconds").value,
      displayAverageSecondsRR: this.form.get("displayAverageSecondsRR").value
    };
  }

  getBodyDetectionSettings(): BodyDetectionSettings {
    return {
      enableBodyDetect: this.form.get("enableBodyDetect").value,
      presenceDetectCount: this.form.get("presenceDetectCount").value,
      detectionType: ((this.form.get("enableBodyDetect").value == true && this.detectionType != null) ? this.detectionType.id : null)
    };
  }

  getCloudSettings(): CloudSettings {
    return {
      enabled: this.form.get("cloudEnabled").value,
      runDataCloudEndpoint: this.form.get("runDataCloudEndpoint").value
    };
  }
}
