import { Injectable } from '@angular/core';

import { ApiService } from 'src/services/api/api.service';

import { EnumMap } from 'src/models/enum-map';
import { Species } from 'src/models/species';
import { UnitStatusFlags } from 'src/models/unit';
import { PatientStatus } from 'src/models/patient';

@Injectable({
  providedIn: 'root'
})
export class EnumService {

  constructor(private apiService: ApiService) {
      this.fetchEnumMaps();
  }

  public sexes: EnumMap[] = [];
  public species: Species[] = [];
  public weightUnits: EnumMap[] = [];
  public temperatureUnits: EnumMap[] = [];
  public staffTypes: EnumMap[] = [];

  public async fetchEnumMaps() {
      this.sexes = await this.apiService.getSexOptions();
      this.species = await this.apiService.getSpeciesOptions();
      this.weightUnits = await this.apiService.getWeightsOptions();
      this.temperatureUnits = await this.apiService.getTemperaturesOptions();
      this.staffTypes = await this.apiService.getStaffTypeOptions();
  }

  public getSexName(id: number) {
      let s = this.sexes.find(t => t.id === id);
      return s ? s.name : null;
  }
  public getSexInitialism(id: number) {
      let name = this.getSexName(id);
      if (!name) { return null; }
      let regex = /\w+/g;
      let initials = '';
      let result = regex.exec(name);
      while (result) {
          initials += result[0].charAt(0).toUpperCase();
          result = regex.exec(name);
      }
      return initials;
  }

  public getSpeciesName(id: number) {
      let s = this.species.find(t => t.id === id);
      return s ? s.name : null;
  }
  public getSpecies(id: number): Species {
      let s = this.species.find(t => t.id === id);
      return s || null;
  }

  public getPatientStatus(unitStatus: number): PatientStatus {
      if (!(UnitStatusFlags.Occupied & unitStatus) || !(UnitStatusFlags.AcquiringData & unitStatus)) {
          return PatientStatus.None;
      }
      if (UnitStatusFlags.Alarm & unitStatus) {
          return PatientStatus.Alarm;
      }
      if (UnitStatusFlags.Warning & unitStatus) {
          return PatientStatus.Warning;
      }
      if (UnitStatusFlags.TimerWarning & unitStatus) {
          return PatientStatus.TimerWarning;
      }
      return PatientStatus.Good;
  }
  public getPatientStatusText(patientStatus: PatientStatus): string {
      switch (patientStatus) {
          case PatientStatus.Alarm: return 'Alarm'
          case PatientStatus.Warning: return 'Warning';
          case PatientStatus.TimerWarning: return 'Overtime';
          case PatientStatus.Good: return 'Good';
          case PatientStatus.None: return 'Off';
          default: return null;
      }
  }

  public getWeightUnitText(weightUnit: number): string {
    let unit = this.weightUnits.find(t => t.id === weightUnit);
    return unit ? unit.name : "Kilograms"; // Defaults to kilograms.
	}
  public getWeightUnitInitials(weightUnit: number): string {
		let unit = this.weightUnits.find(t => t.id === weightUnit);
		return unit ? unit.initials : "kg"; // Defaults to kilograms.
	}

  public getTemperatureUnitText(temperatureUnit: number): string {
    let unit = this.temperatureUnits.find(t => t.id === temperatureUnit);
    return unit ? unit.name : "Celsius"; // Defaults to Celsius.
	}
  public getTemperatureUnitInitials(temperatureUnit: number): string {
		let unit = this.temperatureUnits.find(t => t.id === temperatureUnit);
		return unit ? unit.initials : "C"; // Defaults to Celsius.
    }
    
    public getStaffText(staffType: number): string {
      let type = this.staffTypes.find(t => t.id === staffType);
      return type ? type.name : "N/A";
    }
  

}