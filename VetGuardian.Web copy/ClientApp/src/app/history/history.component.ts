import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { RunAndPatient } from 'src/models/run';
import { ApiService } from 'src/services/api/api.service';
import { IconService } from 'src/services/icon/icon.service';
import { EnumService } from 'src/services/enum/enum.service';
import { IpcService } from 'src/services/ipc-service';
import { environment } from 'src/environments/environment.prod';

@Component({
    selector: 'vg-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss']
})
export class HistoryComponent {

    public history: RunAndPatient[];

    public searchName: string = null;
    public searchNameControl = new FormControl();
    private searchNameControlSubscription: Subscription;

    constructor(
        private apiService: ApiService,
        public iconService: IconService,
        public enumService: EnumService,
        private ipcService: IpcService) { }

    ngOnInit() {
        this.loadRuns();    // load the initial set of runs

        this.searchNameControlSubscription = this.searchNameControl.valueChanges
            .pipe(debounceTime(500))
            .subscribe((t: string) => {
                this.loadRuns(t);
            });
    }

    ngAfterViewInit() {
        let resizeEvent = document.createEvent('UIEvent');
        resizeEvent.initEvent('resize', true, true);
        setTimeout(() => window.dispatchEvent(resizeEvent));
    }

    ngOnDestroy() {
        this.searchNameControlSubscription && this.searchNameControlSubscription.unsubscribe();
    }

    private loadRuns(searchParam?: string) {
        if (searchParam && searchParam.length) {
            this.apiService.getFilteredRuns(searchParam).then(rnps => {
                for (let i = 0; i < rnps.length; i++) {
                    rnps[i].run.timestamp = new Date(rnps[i].run.timestamp);
                }
                this.history = rnps;
            });
        } else {
            this.apiService.getRuns().then(rnps => {
                for (let i = 0; i < rnps.length; i++) {
                    rnps[i].run.timestamp = new Date(rnps[i].run.timestamp);
                }
                this.history = rnps;
            });
        }
    }

    async downloadFile(url: string): Promise<void> {
        this.ipcService.send('download', environment.baseUrl + url, {
            saveAs: true,               // Prompts
            openFolderWhenDone: true
        });
    }
}