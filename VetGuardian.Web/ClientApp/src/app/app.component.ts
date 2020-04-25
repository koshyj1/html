import { Component, ElementRef, ViewChild, TemplateRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { map } from 'rxjs/operators';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { VetSettings } from 'src/models/vet-settings';
import { DataService } from 'src/services/data/data.service';
import { VersionService } from 'src/services/version-service';
import { ApiService } from 'src/services/api/api.service';

import { FormGroupCustom } from 'src/shared/form-group-custom';
import { environment } from 'src/environments/environment';
import { UnitSummary, UnitStatusFlags } from 'src/models/unit';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('routerWrapper') routerWrapper: ElementRef;
  @ViewChild('changeLogModal') changeLogModal: BsModalRef;
  @ViewChild('adminLoginModal') adminLoginModal: BsModalRef;

  public changeLogContent: string;

  public unitId: string;
  public version: Observable<string>;
  public statusUpdate: string = "";
  public vetSettings: Promise<VetSettings>
  public name: string;
  private subscriptions: Subscription[] = [];

  private alarmAudio: any;
  private unitsDictionary: object = {};

  public form: FormGroupCustom = new FormGroupCustom({
    password: new FormControl(null, [
      Validators.required
    ]),
  });

  constructor(
    private router: Router,
    private dataService: DataService,
    private versionService: VersionService,
    private apiService: ApiService,
    private bsModalService: BsModalService
  ) { }

  ngOnInit() {
    window.addEventListener('resize', this.onResize);

    this.subscriptions.push(
      this.dataService.activeUnitId.subscribe(t => this.unitId = t),
      this.dataService.vetSettings.subscribe(t => this.name = t.name)
    );

    this.version = this.versionService.getVersion().pipe(map(version => `${version.major}.${version.minor}.${version.build}`));

    this.vetSettings = this.apiService.getVetSettings();
    this.vetSettings.then(t => {
      this.dataService.vetSettings.next(t);
    });

    this.alarmAudio = new Audio("http://localhost:5000/audio/alarm.mp3");
    this.alarmAudio.loop = true;
    this.alarmAudio.load();
  }

  ngAfterViewInit() {
    let resizeEvent = document.createEvent('UIEvent');
    resizeEvent.initEvent('resize', true, true);
    setTimeout(() => window.dispatchEvent(resizeEvent));

    this.stopAudio();

    this.subscriptions.push(
      this.dataService.getOnUnitSummary().subscribe(async (unit: UnitSummary) => {
        this.unitsDictionary[unit.unitId] = unit;

        const alarmedUnits = Object.values(this.unitsDictionary).filter((unitItem: UnitSummary) => (
            (unitItem.status & UnitStatusFlags.Alarm) == UnitStatusFlags.Alarm)
              && ((unitItem.status & UnitStatusFlags.Occupied) == UnitStatusFlags.Occupied)
              && !((unitItem.status & UnitStatusFlags.AlarmAcknowledged) == (UnitStatusFlags.AlarmAcknowledged))
              && (((unitItem.status & UnitStatusFlags.InitalBodyDetect) == UnitStatusFlags.InitalBodyDetect)
                  && !((unitItem.status & UnitStatusFlags.BodyDetected) == UnitStatusFlags.BodyDetected))
        );
        if (alarmedUnits.length > 0) {
          const adminSettings = await this.apiService.getAdminSettings();
          if (adminSettings.chartingSettings.enableAlarm) { 
            this.alarmAudio.play();
          } else{
            this.stopAudio();
          }
        } else{
          this.stopAudio();
        }
      })
    );
  }

  ngOnDestroy() {
    this.stopAudio();

    this.subscriptions.forEach(t => t.unsubscribe());
    window.removeEventListener('resize', this.onResize);
  }

  public onUnitDisplayed(unitId: string) {
    this.dataService.activeUnitId.next(unitId);
  }

  private stopAudio() {
    this.alarmAudio.pause();
    this.alarmAudio.currentTime = 0; // resets the audio track.
  }

  private onResize = (ev: UIEvent) => {
    let el = this.routerWrapper.nativeElement as HTMLDivElement;
    el.style.height = `${(window.innerHeight - el.offsetTop)}px`;
  }

  public async openChangeLog(changeLog: TemplateRef<any>) {
    this.changeLogContent = await this.apiService.getChangeLog();
    this.changeLogModal = this.bsModalService.show(changeLog, { class: 'modal-lg' });
  }

  public openAdminLogin(loginForm: TemplateRef<any>) {
    this.form.reset();
    this.adminLoginModal = this.bsModalService.show(loginForm);
  }

  public async onSubmit() {
    this.form.submitted = true;

    var password = this.form.get("password").value;

    if ((password === environment.password)) {
      this.adminLoginModal.hide();
      this.adminLoginModal = null;

      this.router.navigate(["/admin-settings", { isAuthenticated: true }]);
    } else {
      this.form.addErrors({
        "": ["Invalid password."]
      });
    }
  }


}
