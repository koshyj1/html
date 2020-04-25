import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Device } from 'src/models/device';

import { ApiService } from 'src/services/api/api.service';
import { DataService } from 'src/services/data/data.service';

@Component({
    selector: 'vg-device-list',
    templateUrl: './device-list.component.html',
    styleUrls: [ './device-list.component.scss' ]
})
export class DeviceListComponent {

    public devices: Device[] | void = null;
    public errors: boolean = false;

    constructor(
        private router: Router,
        private apiService: ApiService,
        private dataService: DataService) {}

    async ngOnInit() {
        this.devices = await this.apiService.getDevices()
            .catch(err => {
                console.error(err);
                this.errors = true;
            });
    }

    public configureUnit(device: Device) {
        if (device.unit) {
            this.dataService.activeUnitId.next(device.unit.id);
            this.router.navigate(['/configure', device.unit.id]);
        }
    }

    public addUnit(device: Device) {
        if (!device.unit) {
            this.router.navigate(['/configure/new', device.serialNumber, device.ipAddress]);
        }
    }
}