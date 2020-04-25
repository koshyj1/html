import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ToastrModule, ToastrService } from 'ngx-toastr'

import { AppRoutingModule } from './app-routing.module';
import { ChartsModule } from './charts/charts.module';

import { AppComponent } from './app.component';

import { UnitSummariesComponent } from './unit-summaries/unit-summaries.component';
import { UnitSummaryComponent } from './unit-summary/unit-summary.component';
import { UnitDetailsComponent } from './unit-details/unit-details.component';
import { UnitStatusBarComponent } from './unit-details/status-bar/unit-status-bar.component';
import { UnitMonitorComponent } from './unit-details/monitor/unit-monitor.component';
import { UnitAddPatientComponent } from './unit-details/add-patient/unit-add-patient.component';
import { UnitReviewComponent } from './unit-details/review/unit-review.component';
import { VideoStreamComponent } from './video-stream/video-stream.component';
import { RunLogComponent } from './run-log/run-log.component';
import { UnitConfigurationComponent } from './unit-configuration/unit-configuration.component';
import { DeviceListComponent } from './device-list/device-list.component';
import { HistoryComponent } from './history/history.component';
import { ErrorDisplayComponent } from '../shared/error-display/error-display.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SettingsComponent } from './settings/settings.component';
import { StaffComponent } from './staff/staff.component';

import { CustomTypeaheadDirective } from '../directives/custom-typeahead.directive';
import { AutoFocusDirective } from '../directives/auto-focus.directive';
import { PrettyDatePipe } from '../pipes/pretty-date.pipe';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { AuthGuard } from 'src/guards/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    UnitSummariesComponent,
    UnitSummaryComponent,
    UnitDetailsComponent,
    UnitStatusBarComponent,
    UnitMonitorComponent,
    UnitAddPatientComponent,
    UnitReviewComponent,
    VideoStreamComponent,
    RunLogComponent,
    UnitConfigurationComponent,
    DeviceListComponent,
    HistoryComponent,
    ErrorDisplayComponent,
    SettingsComponent,
    StaffComponent,
    CustomTypeaheadDirective,
    AutoFocusDirective,
    PrettyDatePipe,
    AdminSettingsComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ChartsModule,

    ModalModule.forRoot(),
    ButtonsModule.forRoot(),
    TypeaheadModule.forRoot(),
    BsDropdownModule.forRoot(),
    ToastrModule.forRoot(),
    TabsModule.forRoot()
  ],
  providers: [
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor (toastr: ToastrService) {
    toastr.toastrConfig.positionClass = 'toast-bottom-right';
  }
}
