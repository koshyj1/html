import { Component, AfterViewInit, OnChanges, Input, ViewChild, ElementRef, SimpleChanges, SimpleChange } from '@angular/core';
import { Chart } from "chart.js";

export interface ChartOptions{
  responsive: boolean,
  maintainAspectRatio: boolean,
  legend: object,
  scales: object,
  tooltips: object
}

@Component({
  selector: 'app-base-chart',
  templateUrl: './base-chart.component.html',
  styleUrls: ['./base-chart.component.scss']
})
export class BaseChartComponent implements AfterViewInit, OnChanges {
  @Input("id") id: string;
  @Input("height") height: string = '';
  
  @Input("type") type: string;
  @Input("labels") labels: any[] = [];
  @Input("datasets") datasets: any[] = [];
  @Input("options") options: object = {};
  
  @Input("initializing") initializing: boolean = false;
  @Input("motion") motion: boolean = false;
  @Input("pause") pause: boolean = false;

  @ViewChild('chart')
    private chartRef: ElementRef;
  
  private chart: any;
  
  private lineColor: string = '#FFFFFF'; // defaults to white
  
  ngAfterViewInit() {
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: this.type,
      data: {
        labels: this.labels,
        datasets: this.datasets
      },
      options: this.options
    });
  }
  
  ngOnChanges(changes: SimpleChanges){
    if(this.chart){
      const labels = changes.labels;
      const datasets = changes.datasets;
      const initializing = changes.initializing;
      const pause = changes.pause;
      const motion = changes.motion;

      this.update(
        labels,
        datasets,
        initializing,
        pause,
        motion
      );
    }
  }

  update(labels?: SimpleChange, datasets?: SimpleChange, initializing?: SimpleChange, pause?: SimpleChange, motion?: SimpleChange){
    this.chart.config.data.labels = labels ? labels.currentValue : this.labels;
    
    // For Vet Guardian specific use case, will prevent style animation updates on chart update/rerender.
    if(datasets && datasets.currentValue){
      // Chart Data
      if(datasets.currentValue[0] && datasets.currentValue[0].data){
        this.chart.config.data.datasets[0].data = datasets.currentValue[0].data;
      }
      
      // High Alarm
      if(datasets.currentValue[1] && datasets.currentValue[1].data){
        this.chart.config.data.datasets[1].data = datasets.currentValue[1].data;
      }
      
      // Low Alarm
      if(datasets.currentValue[2] && datasets.currentValue[2].data){
        this.chart.config.data.datasets[2].data = datasets.currentValue[2].data;
      }

      // High Warning
      if(datasets.currentValue[3] && datasets.currentValue[3].data){
        this.chart.config.data.datasets[3].data = datasets.currentValue[3].data;
      }

      // Low Warning
      if(datasets.currentValue[4] && datasets.currentValue[4].data){
        this.chart.config.data.datasets[4].data = datasets.currentValue[4].data;
      }
    }

    this.initializing = initializing ? initializing.currentValue : this.initializing;
    this.pause = pause ? pause.currentValue : this.pause;
    this.motion = motion ? motion.currentValue : this.motion;

    this.chart.options = this.options;
    this.chart.data.datasets[0].borderColor = (this.pause || this.motion) ? '#aaaaaa' : this.lineColor;

    this.chart.update();
  }
}
