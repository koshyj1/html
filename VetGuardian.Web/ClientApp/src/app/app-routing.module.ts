import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UnitDetailsComponent } from './unit-details/unit-details.component';
import { UnitConfigurationComponent } from './unit-configuration/unit-configuration.component';
import { HistoryComponent } from './history/history.component';
import { DeviceListComponent } from './device-list/device-list.component';
import { SettingsComponent } from './settings/settings.component';
import { StaffComponent } from './staff/staff.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { AuthGuard } from 'src/guards/auth.guard';

const appRoutes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: UnitDetailsComponent },
    { path: 'home/:runId/:unitId/:patientId', component: UnitDetailsComponent },
    { path: 'configure/:id', component: UnitConfigurationComponent },
    { path: 'configure/new/:serialNumber/:ipAddress', component: UnitConfigurationComponent },
    { path: 'history', component: HistoryComponent },
    { path: 'admin-settings', component: AdminSettingsComponent, canActivate: [AuthGuard]  },
    { path: 'settings', component: SettingsComponent },
    { path: 'staff', component: StaffComponent },
    { path: 'devices', component: DeviceListComponent }
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes, { useHash: true }
        )
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {}