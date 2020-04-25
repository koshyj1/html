import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { Observable, BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { map, tap, share } from 'rxjs/operators';

import { ApiService } from '../api/api.service';
import { TimeService } from '../time/time.service';
import { ToastrService } from 'ngx-toastr';

import { UnitSummary, Unit } from 'src/models/unit';
import { LiveDatum, LiveVideoFrame } from 'src/models/live-data';
import { LogEntry, LogType } from 'src/models/log-entry';
import { VetSettings } from '../../models/vet-settings';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private hubConnection: HubConnection;
  private onLiveData: Observable<LiveDatum>;
  private onLiveVideo: Observable<LiveVideoFrame>;
  private onUnitSummary: Observable<UnitSummary>;
  private onLogEntry: Observable<LogEntry>;
  private onNewUnit: Observable<Unit>;
  private onDeleteUnit: Observable<string>;

  public vetSettings = new Subject<VetSettings>();
  public activeUnitId = new BehaviorSubject<string>(null);
  
  private onStartAcquisition = new Subject();
  private onPauseAcquisition = new Subject();
  private onStopAcquisition = new Subject();

  public startAcquisition$ = this.onStartAcquisition.asObservable();
  public pauseAcquisition$ = this.onPauseAcquisition.asObservable();
  public stopAcquisition$ = this.onStopAcquisition.asObservable();

  private recentData = new Object();

  constructor(
    private apiService: ApiService,
    private timeService: TimeService,
    private toastr: ToastrService)
  {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.baseUrl + "/monitorHub")
      .build();
    this.onLiveData = fromEvent<LiveDatum>(this.hubConnection, 'liveData')
      .pipe<LiveDatum>(map((t: LiveDatum) => {
        t.timestamp = new Date();
        return t;
      }))
      .pipe<LiveDatum>(tap((t: LiveDatum) => {
        if (!this.recentData.hasOwnProperty(t.unitId)) {
          this.recentData[t.unitId] = [];
        }
        let arr = this.recentData[t.unitId] as Array<LiveDatum>;
        arr.push(t);
        while (arr.length > 30) { arr.shift(); }
      }))
      .pipe<LiveDatum>(share());

    this.onLiveVideo = fromEvent(this.hubConnection, 'liveVideo')
      .pipe<LiveVideoFrame>(share<LiveVideoFrame>());

    this.onUnitSummary = fromEvent(this.hubConnection, 'unitSummary')
      .pipe<UnitSummary>(share<UnitSummary>());

    this.onLogEntry = fromEvent(this.hubConnection, 'newLog')
      .pipe<LogEntry>(map((t: LogEntry) => {
        if (typeof t.timestamp === 'string') {
          t.timestamp = this.timeService.parseDateString(t.timestamp);
        }
        if (typeof t.modified === 'string') {
          t.modified = this.timeService.parseDateString(t.modified);
        }
        return t;
      }))
      .pipe<LogEntry>(tap((t: LogEntry) => {
        if (t.logType === LogType.Alarm || t.logType === LogType.Warning || t.logType === LogType.System) {
          this.apiService.getRun(t.runId).then(async rnp => {
            let unitPromise = this.apiService.getUnit(rnp.run.unitId);
            let patientPromise = this.apiService.getPatient(rnp.run.patientId);
            let unit = await unitPromise;
            let patient = await patientPromise;
            switch(t.logType) {
              case LogType.Alarm:   this.toastr.error(  t.message,  `${unit.name} (${patient.name})`);  break;
              case LogType.Warning: this.toastr.warning(t.message,  `${unit.name} (${patient.name})`);  break;
              case LogType.System:  this.toastr.info(   t.message,  `${unit.name} (${patient.name})`);  break;
            }
          });
        }
      }))
      .pipe<LogEntry>(share());

    this.onNewUnit = fromEvent(this.hubConnection, 'newUnit')
      .pipe<Unit>(share<Unit>());

    this.onDeleteUnit = fromEvent(this.hubConnection, 'deleteUnit')
      .pipe<string>(share<string>());


    this.hubConnection.start().then(() => console.log('Connected!'));
  }

  public start() {
    this.onStartAcquisition.next();
  }

  public pause() {
    this.onPauseAcquisition.next();
  }

  public stop() {
    this.onStopAcquisition.next();
  }

  public getOnLiveData() : Observable<LiveDatum> {
    return this.onLiveData;
  }

  public getOnLiveVideo() : Observable<LiveVideoFrame> {
    return this.onLiveVideo;
  }

  public getOnUnitSummary() : Observable<UnitSummary> {
    return this.onUnitSummary;
  }

  public getOnLogEntry() : Observable<LogEntry> {
    return this.onLogEntry;
  }

  public getOnNewUnit() : Observable<Unit> {
    return this.onNewUnit;
  }

  public getOnDeleteUnit() : Observable<string> {
    return this.onDeleteUnit;
  }

  public getRecentData(unitId: string): Array<LiveDatum> {
    return this.recentData[unitId] || [];
  }

  public clearData(unitId: string): void {
    delete this.recentData[unitId];
  }
}
