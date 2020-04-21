import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Unit, UnitSummary } from 'src/models/unit';
import { Run, RunAndPatient } from 'src/models/run';
import { LogEntry, LogType } from 'src/models/log-entry';
import { Patient } from 'src/models/patient';
import { EnumMap } from 'src/models/enum-map';
import { Device } from 'src/models/device';
import { Species } from 'src/models/species';
import { AdminSettings } from 'src/models/admin-settings';
import { VetSettings } from 'src/models/vet-settings';
import { Staff, StaffType } from 'src/models/staff';
import { environment } from '../../environments/environment';
import { PatientViewModel } from 'src/models/patient-view-model';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) {}

    /** GET all of the units */
    public async getUnits(): Promise<Unit[]> {
        return this.http.get<Unit[]>(environment.baseUrl + '/api/units').toPromise();
    }

    /** GET a specific unit */
    public async getUnit(unitId: string): Promise<Unit> {
        return this.http.get<Unit>(environment.baseUrl + `/api/units/${unitId}`).toPromise();
    }

    /** CREATE a new unit */
    public async createUnit(unit: Unit): Promise<string> {
        //return this.http.post<string>(environment.baseUrl + '/api/units', unit, {responseType: 'text'}).toPromise();
        return this.http.post<string>(environment.baseUrl + '/api/units', unit, {responseType:'text' as any}).toPromise();
    }

    /** UPDATE a specific, existing unit */
    public async updateUnit(unit: Unit): Promise<void> {
        return this.http.put<void>(environment.baseUrl + `/api/units/${unit.id}`, unit).toPromise();
    }

    /** DELETE a specific, existing unit */
    public async deleteUnit(unitId: string): Promise<void> {
        return this.http.delete<void>(environment.baseUrl + `/api/units/${unitId}`).toPromise();
    }

    /** GET all of the unit summaries */
    public async getUnitSummaries(): Promise<UnitSummary[]> {
        return this.http.get<UnitSummary[]>(environment.baseUrl + '/api/units/summary/').toPromise();
    }

    /** STARTS the data acquisition on the specified unit */
    public async startDataAcquisition(unitId: string, patientId: string, temperature?: number, heartrate?: number, respirationrate?: number, weight?: number, weightUnit?: number, temperatureUnit?: number, attendingDoctorId?: number, vetTechId?: number): Promise<void> {
        return this.http.put<void>(environment.baseUrl + `/api/units/${unitId}/dataacquisition/start?patientId=${patientId}&temperature=${temperature}&heartrate=${heartrate}&respirationrate=${respirationrate}&weight=${weight}&temperatureUnit=${temperatureUnit}&weightUnit=${weightUnit}&attendingDoctorId=${attendingDoctorId}&vetTechId=${vetTechId}`, {}).toPromise();
    }
    /** PAUSE the data acquisition on the specified unit */
    public async pauseDataAcquisition(unitId: string): Promise<void> {
        return this.http.put<void>(environment.baseUrl + `/api/units/${unitId}/dataacquisition/pause`, {}).toPromise();
    }
    /** STOPS the data acquisition on the specified unit */
    public async stopDataAcquisition(unitId: string): Promise<void> {
        return this.http.put<void>(environment.baseUrl + `/api/units/${unitId}/dataacquisition/stop`, {}).toPromise();
    }

    /** STARTS the video on the specified unit */
    public async startVideo(unitId: string): Promise<void> {
        return this.http.put<void>(environment.baseUrl + `/api/units/${unitId}/video/start`, {}).toPromise();
    }
    /** STOPS the video on the specified unit */
    public async stopVideo(unitId: string): Promise<void> {
        return this.http.put<void>(environment.baseUrl + `/api/units/${unitId}/video/stop`, {}).toPromise();
    }

    /** CLEAR a unit, marking it as unoccupied */
    public async clearUnit(unitId: string): Promise<void> {
        return this.http.put<void>(environment.baseUrl + `/api/units/${unitId}/clear`, {}).toPromise();
    }

    /** Acknowledges run alarm on the specific unit */
    public async acknowledgeAlarm(unitId: string): Promise<void> {
      return this.http.put<void>(environment.baseUrl + `/api/units/${unitId}/acknowledgealarm`, {}).toPromise();
    }

    /** SET the temperature for the run active in the unit */
    public async setTemperature(unitId: string, temperature: number): Promise<void> {
      return this.http.put<void>(environment.baseUrl + `/api/units/${unitId}/temperature?temperature=${temperature}`, {}).toPromise();
    }

    /** SET the heartrate for the run active in the unit */
    public async setHeartrate(unitId: string, heartrate: number): Promise<void> {
      return this.http.put<void>(environment.baseUrl + `/api/units/${unitId}/heartrate?heartrate=${heartrate}`, {}).toPromise();
    }

    /** SET the respiration rate for the run active in the unit */
    public async setRespirationRate(unitId: string, respirationrate: number): Promise<void> {
      return this.http.put<void>(environment.baseUrl + `/api/units/${unitId}/respirationrate?respirationrate=${respirationrate}`, {}).toPromise();
    }

    /** GET all of the runs */
    public async getRuns(): Promise<RunAndPatient[]> {
        return this.http.get<RunAndPatient[]>(environment.baseUrl + '/api/runs').toPromise();
    }

    /** GET runs filtered by the patient and owner names */
    public async getFilteredRuns(name: string): Promise<RunAndPatient[]> {
        return this.http.get<RunAndPatient[]>(environment.baseUrl + `/api/runs/search/${name}`).toPromise();
    }

    /** GET a specific run */
    public async getRun(runId: string): Promise<RunAndPatient> {
        return this.http.get<RunAndPatient>(environment.baseUrl + `/api/runs/${runId}`).toPromise();
    }

    /** GET all log entries associated with a specific run */
    public async getRunLogs(runId: string): Promise<LogEntry[]> {
        return this.http.get<LogEntry[]>(environment.baseUrl + `/api/runs/${runId}/logs`).toPromise();
    }

    /** CREATE a new run log entry */
    public async createRunLog(message: string, logType: LogType, runId: string): Promise<void>;
    public async createRunLog(logEntry: LogEntry): Promise<void>;
    public async createRunLog(msg: string | LogEntry, type: LogType = undefined, runId: string = undefined): Promise<void>
    {
        if (typeof msg === 'object') {
            return this.http.post<void>(environment.baseUrl + `/api/runs/${msg.runId}/logs?message=${msg.message}&logType=${msg.logType}`, {}).toPromise();
        }
        else {
            return this.http.post<void>(environment.baseUrl + `/api/runs/${runId}/logs?message=${msg}&logType=${type}`, {}).toPromise();
        }
    }

    /** GET all of the patients */
    public async getPatients(): Promise<Patient[]> {
        return this.http.get<Patient[]>(environment.baseUrl + '/api/patients').toPromise();
    }

    /** GET a specific, existing patient */
    public async getPatient(patientId: string): Promise<Patient> {
        return this.http.get<Patient>(environment.baseUrl + `/api/patients/${patientId}`).toPromise();
    }

    /** CREATE a new patient. The patient will be returned with the ID field populated. */
    public async createPatient(patient: PatientViewModel): Promise<Patient> {
        return this.http.post<Patient>(environment.baseUrl + '/api/patients', patient).toPromise();
    }

    /** UPDATE a patient */
    public async updatePatient(id: string, patient: PatientViewModel): Promise<Patient> {
        return this.http.put<Patient>(environment.baseUrl + `/api/patients/${id}`, patient).toPromise();
    }

    /** GET all of the species options */
    public async getSpeciesOptions(): Promise<Species[]> {
        return this.http.get<Species[]>(environment.baseUrl + '/api/species').toPromise();
    }
    /** GET all of the sex options */
    public async getSexOptions(): Promise<EnumMap[]> {
        return this.http.get<EnumMap[]>(environment.baseUrl + '/api/sexes').toPromise();
    }
    /** GET all of the temperations units. */
    public async getTemperaturesOptions(): Promise<EnumMap[]> {
        return this.http.get<EnumMap[]>(environment.baseUrl + '/api/temperatures').toPromise();
    }
    /** GET all of the weight units. */
    public async getWeightsOptions(): Promise<EnumMap[]> {
        return this.http.get<EnumMap[]>(environment.baseUrl + '/api/weights').toPromise();
    }
    /** GET all of the staff types. */
    public async getStaffTypeOptions(): Promise<EnumMap[]> {
        return this.http.get<EnumMap[]>(environment.baseUrl + '/api/staff/types').toPromise();
    }
    /** GET all of the detection types. */
    public async getDetectionTypes(): Promise<EnumMap[]> {
        return this.http.get<EnumMap[]>(environment.baseUrl + '/api/detectiontypes').toPromise();
    }

    /** GET all of the LabJack devices */
    public async getDevices(): Promise<Device[]> {
        return this.http.get<Device[]>(environment.baseUrl + '/api/devices').toPromise();
    }

    /**
     * Gets the change log.
     */
    public async getChangeLog() : Promise<string> {
        const requestOptions: Object = {
            /* other options here */
            responseType: 'text'
        }
        return this.http.get<string>(environment.baseUrl + '/CHANGELOG', requestOptions).toPromise();
    }

    /**
     * Gets the current admin settings.
     */
    public async getAdminSettings() : Promise<AdminSettings> {
        return this.http.get<AdminSettings>(environment.baseUrl + '/api/settings/admin-settings').toPromise();
    }

    /**
     * Updates the admin settings.
     * @param adminSettings 
     */
    public async updateAdminSettings(adminSettings: AdminSettings) : Promise<void> {
        return this.http.put<void>(environment.baseUrl + '/api/settings/admin-settings', adminSettings).toPromise();
    }

    /**
     * Gets the current vet settings.
     */
    public async getVetSettings() : Promise<VetSettings> {
        return this.http.get<VetSettings>(environment.baseUrl + '/api/settings/vet-settings').toPromise();
    }

    /**
     * Updates the vet settings.
     * @param vetSettings 
     */
    public async updateVetSettings(vetSettings: VetSettings) : Promise<void> {
        return this.http.put<void>(environment.baseUrl + '/api/settings/vet-settings', vetSettings).toPromise();
    }

    public async updateVetLogo(logo: File) : Promise<void> {
        const uploadData = new FormData();
        uploadData.append('image', logo, logo.name);

        return this.http.post<void>(environment.baseUrl + '/api/settings/vet-settings/logo', uploadData).toPromise();
    }

    /** GET all of the staff */
    public async getStaff(): Promise<Staff[]> {
        return this.http.get<Staff[]>(environment.baseUrl + `/api/staff`).toPromise();
    }
    
    /** GET a specific, existing staff */
    public async getStaffById(staffId: string): Promise<Staff> {
        return this.http.get<Staff>(environment.baseUrl + `/api/staff/${staffId}`).toPromise();
    }

    /** CREATE a new staff. The staff will be returned with the ID field populated. */
    public async createStaff(staff: Staff): Promise<Staff> {
        return this.http.post<Staff>(environment.baseUrl + '/api/staff', staff).toPromise();
    }

    /** UPDATE a staff */
    public async updateStaff(id: string, staff: Staff): Promise<Staff> {
        return this.http.put<Staff>(environment.baseUrl + `/api/staff/${id}`, staff).toPromise();
    }

    /** DELETE a staff */
    public async deleteStaff(id: string): Promise<void> {
        return this.http.delete<void>(environment.baseUrl + `/api/staff/${id}`).toPromise();
    }
}
