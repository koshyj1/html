import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ApiService } from 'src/services/api/api.service';
import { DataService } from 'src/services/data/data.service';
import { IconDefinition } from '@fortawesome/pro-solid-svg-icons';
import { IconService } from 'src/services/icon/icon.service';

@Component({
    selector: 'vg-video-stream',
    templateUrl: './video-stream.component.html',
    styleUrls: [ './video-stream.component.scss' ]
})
export class VideoStreamComponent {

    public imageData: string;

    @Input() unitId: string;
    @Input() videoEnabled: boolean;

    public noVideoIcon: IconDefinition;
    public disableVideoBtn: boolean = false;

    private subscriptions: Subscription[] = [];


    constructor (
        private apiService: ApiService,
        private dataService: DataService,
        private iconService: IconService) {}

    ngOnInit() {
        this.noVideoIcon = this.iconService.getVideoIcon(false);
        this.subscriptions.push(
            this.dataService.getOnLiveVideo().pipe(filter(t => t.unitId === this.unitId)).subscribe(t => this.imageData = t.frame)
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(t => t.unsubscribe());
    }


    async enableVideo() {
        this.disableVideoBtn = true;
        await this.apiService.startVideo(this.unitId);
        this.disableVideoBtn = false;
    }

    async disableVideo() {
        this.disableVideoBtn = true;
        await this.apiService.stopVideo(this.unitId);
        this.imageData = null;
        this.disableVideoBtn = false;
    }

}