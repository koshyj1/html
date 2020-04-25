import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { ApiService } from 'src/services/api/api.service';
import { DataService } from '../../services/data/data.service';
import { IconService } from 'src/services/icon/icon.service';

import { LogEntry, LogType } from 'src/models/log-entry';
import { IconDefinition } from '@fortawesome/pro-solid-svg-icons';

@Component({
    selector: 'vg-run-log',
    templateUrl: './run-log.component.html',
    styleUrls: [ './run-log.component.scss' ]
})
export class RunLogComponent {
    @ViewChild('container') container: ElementRef;
    @ViewChild(ModalDirective) modal: ModalDirective;

    private _runId: string;
    @Input() public set runId(value) {
        this.clearSubscriptions(); 
        this.logs = [];
        this._runId = value;
        if (value && value.length) {
            this.fetchLogs();
            this.subscribeData();
        }
    }
    public get runId() { let x = this._runId; return x; }

    private _maxHeight: number;
    @Input() public set maxHeight(value) {
        if (value) {
            (this.container.nativeElement as HTMLDivElement).style.maxHeight = `${value}px`;
        } else {
            (this.container.nativeElement as HTMLDivElement).style.maxHeight = null;
        }
    }
    public get maxHeight() { return this._maxHeight; }

    public logs: LogEntry[] = [];
    public addIcon: IconDefinition;
    public newNoteText: string;

    private subscriptions: Subscription[] = [];

    constructor(
        private apiService: ApiService,
        private dataService: DataService,
        private iconService: IconService
    ) {}

    async fetchLogs() {
        this.logs = await this.apiService.getRunLogs(this._runId);
    }

    subscribeData() {
        this.subscriptions.push(
            this.dataService.getOnLogEntry().pipe(filter(t => t.runId === this.runId)).subscribe(t => this.logs.unshift(t))
        );
    }

    clearSubscriptions() {
        while (this.subscriptions.length) {
            this.subscriptions.pop().unsubscribe();
        }
    }

    ngOnInit() {
        this.addIcon = this.iconService.getAddIcon();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(t => t.unsubscribe());
    }

    showModal() { this.modal.show(); }
    hideModal() { this.modal.hide(); }

    onAddNoteHidden(e: ModalDirective) { this.newNoteText = ''; }
    async createNote() {
        if (this.newNoteText && this.newNoteText.trim().length) {
            await this.apiService.createRunLog(this.newNoteText, LogType.User, this._runId);
        }
        this.hideModal();
    }
}