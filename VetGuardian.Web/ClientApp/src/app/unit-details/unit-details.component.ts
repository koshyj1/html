import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { DataService } from '../../services/data/data.service';

import { UnitSummary, UnitStatusFlags } from 'src/models/unit';

@Component({
    selector: 'vg-unit-details',
    templateUrl: './unit-details.component.html',
    styleUrls: [ './unit-details.component.scss' ]
})
export class UnitDetailsComponent {
    public unitId: string;
    public runId: string;
    public patientId: string;

    public get isOccupied() { return UnitStatusFlags.Occupied === (UnitStatusFlags.Occupied & this.unitStatus); }
    public get isAcquiring() { return UnitStatusFlags.AcquiringData === (UnitStatusFlags.AcquiringData & this.unitStatus); }

    private unitStatus: number;
    public unitSummary: UnitSummary = null;

    private subscriptions: Subscription[] = [];
    private unitIdSubscription: Subscription = null;

    constructor(private dataService: DataService, private route: ActivatedRoute) {}

    ngOnInit() {
        this.unitId = this.route.snapshot.paramMap.get('unitId');
        this.runId = this.route.snapshot.paramMap.get('runId');
        this.patientId = this.route.snapshot.paramMap.get('patientId');

        if(this.unitId){
            this.activateUnit();
        }
        
        this.unitIdSubscription = this.dataService.activeUnitId.subscribe(t => {
            this.clearSubscriptions();
            this.unitId = t;
            this.unitSummary = null;
            this.subscribeUnitSummary();
        });
    }

    ngOnDestroy() {
        this.unitIdSubscription && this.unitIdSubscription.unsubscribe();
        this.clearSubscriptions();
    }

    private activateUnit(){
        this.dataService.activeUnitId.next(this.unitId);
    }

    private clearSubscriptions() {
        while (this.subscriptions.length > 0) {
            this.subscriptions.pop().unsubscribe();
        }
    }

    private subscribeUnitSummary() {
        this.subscriptions.push(
            this.dataService.getOnUnitSummary().pipe(filter(t => t.unitId === this.unitId)).subscribe(t => {
                this.unitStatus = t.status;
                this.unitSummary = t;
            })
        );
    }

}