import { Injectable, OnInit } from '@angular/core';

import { EnumService } from '../enum/enum.service';
import { PatientStatus } from 'src/models/patient';

import { UnitStatusFlags } from 'src/models/unit';
import { Species } from 'src/models/species';

import * as proRegular from '@fortawesome/pro-regular-svg-icons';
import * as proSolid from '@fortawesome/pro-solid-svg-icons';
import * as proLight from '@fortawesome/pro-light-svg-icons';
import { IconDefinition } from '@fortawesome/pro-regular-svg-icons';

@Injectable({
  providedIn: 'root'
})
export class IconService {
    
    public faVideo: IconDefinition = proRegular.faVideo;
    public faVideoActive: IconDefinition = proSolid.faVideo;

    public faCircleSolid: IconDefinition = proSolid.faCircle;
    public faCircleHollow: IconDefinition = proRegular.faCircle;
    public faCircleMinus: IconDefinition = proSolid.faMinusCircle;  // TODO find a half-circle icon for the warning status
    public faAlarmClock: IconDefinition = proSolid.faAlarmClock;
    public faCircleQuestion: IconDefinition = proSolid.faQuestionCircle;

    public faDog: IconDefinition = proSolid.faDog;
    public faCat: IconDefinition = proSolid.faCat;
    public faPaw: IconDefinition = proSolid.faPaw;
    public faUser: IconDefinition = proSolid.faUser;

    public faMars: IconDefinition = proSolid.faMars;
    public faVenus: IconDefinition = proSolid.faVenus;

    public faWrench: IconDefinition = proSolid.faWrench;
    public faPlusSquare: IconDefinition = proLight.faPlusSquare;
    public faCheck: IconDefinition = proSolid.faCheck;

    public faPlus: IconDefinition = proSolid.faPlus;
    public faEdit: IconDefinition = proSolid.faEdit;
    public faExclamationSquare: IconDefinition = proSolid.faExclamationSquare;

    constructor(private enumService: EnumService) {}

    public getSpeciesIcon(speciesId: number): IconDefinition;
    public getSpeciesIcon(species: Species): IconDefinition;
    public getSpeciesIcon(species: number | Species): IconDefinition {
        let id: number;
        if (species) {
            id = typeof species ==='number' ? species : species.id;
        } else {
            id = null;
        }

        switch (id) {
            case 1:     // puppy
            case 2:     // small dog
            case 3:     // medium dog
            case 4:     // large dog
                return this.faDog;
            case 5:     // kitten
            case 6:     // small cat
            case 7:     // medium cat
            case 8:     // large cat
                return this.faCat;
            case 9:  // Vik
               return this.faUser;
            default:
                return this.faPaw;
        }
    }


    public getPatientStatusIcon(patientStatus: PatientStatus ): [IconDefinition, string] {
        switch (patientStatus) {
            case PatientStatus.Alarm: return [this.faCircleSolid, 'text-danger'];
            case PatientStatus.Warning: return [this.faCircleMinus, 'text-warning'];
            case PatientStatus.TimerWarning: return [this.faAlarmClock, 'text-warning'];
            case PatientStatus.Good: return [this.faCircleHollow, 'text-info'];
            case PatientStatus.None: return [this.faCircleHollow, 'text-lighter-gray'];
            default: return [this.faCircleQuestion, 'text-white'];
        }
    }


    public getSexIcon(sexId: number): IconDefinition;
    public getSexIcon(sexName: string): IconDefinition;
    public getSexIcon(sex: number | string): IconDefinition {
        let name: string;
        if (typeof sex === 'number') {
            name = this.enumService.getSexName(sex);
        } else {
          name = sex;
        }

        if (name) {
            if (name.includes('Female')) {
                return this.faVenus;
            } else if (name.includes('Male')) {
                return this.faMars;
            }
        }
        return this.faCircleQuestion;
    }

    public getVideoIcon(active: boolean): IconDefinition {
        return active ? this.faVideoActive : this.faVideo;
    }

    public getAddIcon(): IconDefinition {
        return this.faPlus;
    }
    public getErrorIcon(): IconDefinition {
        return this.faExclamationSquare;
    }
}
