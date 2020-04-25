import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LineChartComponent } from './line-chart/line-chart.component';
import { BaseChartComponent } from './base-chart/base-chart.component';
import { ScatterChartComponent } from './scatter-chart/scatter-chart.component';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    BaseChartComponent,
    LineChartComponent,
    ScatterChartComponent
  ],
  declarations: [LineChartComponent, BaseChartComponent, ScatterChartComponent]
})
export class ChartsModule { }
