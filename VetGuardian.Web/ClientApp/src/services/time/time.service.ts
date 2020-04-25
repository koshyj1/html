import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeService {

    public getRunTimeString(runTime: number) {
        let minutes = Math.floor(runTime / 60).toString();
        let seconds = Math.floor(runTime % 60).toString();
        if (seconds.length < 2) {
            seconds = '0' + seconds;
        }
        return `${minutes}:${seconds}`;
    }

    public parseDateString(time: string): Date {
        return new Date(time);
    }

}