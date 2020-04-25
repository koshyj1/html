import { Component, HostBinding, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';

import { Unit, UnitSummary } from '../../models/unit';
import { ApiService } from 'src/services/api/api.service';
import { DataService } from 'src/services/data/data.service';

@Component({
    selector: 'vg-unit-summaries',
    template: `
        <vg-unit-summary *ngFor="let u of units"
            [id]="u.id"
            [class.active]="u.id === activeUnitId"
            (show)="onCardShow($event)"
        ></vg-unit-summary>`,
    styles: [':host { height: 210px }']
})
export class UnitSummariesComponent {

    @Output() public unitDisplayed: EventEmitter<string> = new EventEmitter();

    @HostBinding('class.card-deck') isCardDeck: boolean = true;
    @HostBinding('class.mt-3') isMt3: boolean = true;
    @HostBinding('class.units') isUnits: boolean = true;

    private subscriptions: Subscription[] = [];

    constructor(
        private apiService: ApiService,
        private dataService: DataService) {}

    public units: Unit[] = [];
    public activeUnitId: string = null;

    async ngOnInit() {
        this.units = await this.apiService.getUnits();

        while (this.units.length < 8) {
            this.units.push({} as Unit);
        }

        this.subscriptions.push(
            // Listen for new units being added
            this.dataService.getOnNewUnit().subscribe(t => {
                let index = this.units.findIndex(u => !u.id);
                if (index >= 0) {
                    this.units[index] = t;
                } else {
                    this.units.push(t);
                }
            })
        );

        this.subscriptions.push(
            // Listen for existing units being deleted
            this.dataService.getOnDeleteUnit().subscribe(t => {
                let index = this.units.findIndex(u => u.id === t);
                if (index >= 0) {
                    this.units.splice(index, 1);
                    while (this.units.length < 8) {
                        this.units.push({} as Unit);
                    }
                    if (this.activeUnitId === t) {
                        this.onCardShow(null);
                    }
                }
            })
        );

        this.subscriptions.push(
            // Listen for the active unit being changed
            this.dataService.activeUnitId.subscribe(t => this.activeUnitId = t)
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(t => t.unsubscribe());
    }

    private onCardShow(id) {
        this.unitDisplayed.emit(id);
    }
}