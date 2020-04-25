import { Component, OnInit, Input } from '@angular/core';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit {
  @Input("id") id: string;
  @Input("height") height: string = '';
  @Input("labels") labels: any[] = [];
  @Input("datasets") datasets: any[] = [];

  @Input("stacked") stacked: boolean = false;
  @Input("yMin") yMin?: number = null;
  @Input("yMax") yMax?: number = null;
  @Input("yStepSize") yStepSize?: number = null;
  @Input("yUnits") yUnits: string = "";
  @Input("yTickStyle") yTickStyle?: string = null;
  @Input("yTickColor") yTickColor?: string = null;
  @Input("yDisplay") yDisplay: boolean = false;
  @Input("yGridLines") yGridLines?: object = {};
  @Input("yAfterFit") yAfterFit: boolean = false;
  @Input("yScaleWidth") yScaleWidth?: number;
  @Input("yType") yType: string = "";
  @Input("yPrecision") yPrecision?: number = null;

  @Input("xMin") xMin?: number = null;
  @Input("xMax") xMax?: number = null;
  @Input("xStepSize") xStepSize?: number = null;
  @Input("xUnits") xUnits: string = "";
  @Input("xTickStyle") xTickStyle?: string = null;
  @Input("xTickColor") xTickColor?: string = null;
  @Input("xGridLines") xGridLines: object = {};
  @Input("xDisplay") xDisplay: boolean = false;
  @Input("xScaleLabelDisplay") xScaleLabelDisplay: boolean = false;
  @Input("xScaleLabelLabel") xScaleLabelLabel: string = "";
  @Input("xAfterFit") boolean: boolean = false;
  @Input("xType") xType: string = "";
  @Input("xPrecision") xPrecision?: number = null;

  @Input("title") title: string = "";
  @Input("responsive") responsive: boolean = true;
  @Input("maintainAspectRatio") maintainAspectRatio: boolean = false;
  @Input("displayLegend") displayLegend: boolean = true;
  @Input("showLine") showLine: boolean = true;
  @Input("hiddenLegends") hiddenLegends: any[] = [];

  @Input("enableToolTip") enableToolTip: boolean = false;
  @Input("toolTipCallback") toolTipCallback: any; // Function that generates the custom tooltip.
  
  @Input("initializing") initializing: boolean = true;
  @Input("motion") motion: boolean = false;
  @Input("pause") pause: boolean = false;

  public options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {},
    scales: {},
    tooltips: {}
  };

  ngOnInit(){
    this.initOptions();
  }

  initOptions(){
    if(this.title){
      this.options["title"] = {
        display: true,
        text: this.title
      }
    }

    this.options["responsive"] = this.responsive;
    this.options["maintainAspectRatio"] = this.maintainAspectRatio;
    this.options["showLine"] = this.showLine;
    
    this.initLegend();
    this.initScales();
    this.initToolTips();
  }

  initLegend(){
    this.options["legend"] = {
      display: this.displayLegend
    }
  }
  
  initScales(){
    this.initXAxis();
    this.initYAxis();
  }

  initXAxis(){
    var options = {};

    if(this.xType){
      options["type"] = this.xType;
    }
    options["display"] = this.xDisplay;

    options["scaleLabel"] = {};
    options["scaleLabel"].display = this.xScaleLabelDisplay;
    options["scaleLabel"].label = this.xScaleLabelLabel || "";

    if(this.xGridLines){
      options["gridLines"] = this.xGridLines;
    }
    
    options["ticks"] = {};
    options["ticks"].major = {};
    if(this.xTickStyle){
      options["ticks"].major["fontStyle"] = this.xTickStyle;
    }
    if(this.xTickColor){
      options["ticks"].major["fontColor"] = this.xTickColor;
    }

    if(this.xPrecision){
      options["ticks"].precision = this.xPrecision;
    }

    if(this.xMin){
      options["scales"].xAxes.forEach(opt => opt.ticks.min = this.xMin);
    }
    if(this.xMax){
      options["scales"].xAxes.forEach(opt => opt.ticks.max = this.xMax);
    }
    if(this.xStepSize){
      options["scales"].xAxes.forEach(opt => opt.ticks.stepSize = this.xStepSize);
    }

    this.options.scales["xAxes"] = [options];
  }

  initYAxis(){
    var options = {};

    if(this.yType){
      options["type"] = this.yType;
    }
    options["display"] = this.yDisplay;

    if(this.yGridLines){
      options["gridLines"] = this.yGridLines;
    }

    options["ticks"] = {};
    options["ticks"].major = {};
    if(this.yTickStyle){
      options["ticks"].major["fontStyle"] = this.yTickStyle;
    }
    if(this.yTickColor){
      options["ticks"].major["fontColor"] = this.yTickColor;
    }
    
    if(this.yPrecision){
      options["ticks"].precision = this.yPrecision;
    }
    
    if(this.yMin){
      options["scales"].yAxes.forEach(opt => opt.ticks.min = this.yMin);
    }
    if(this.yMax){
      options["scales"].yAxes.forEach(opt => opt.ticks.max = this.yMax);
    }
    if(this.yStepSize){
      options["scales"].yAxes.forEach(opt => opt.ticks.stepSize = this.yStepSize);
    }

    if(this.yAfterFit && this.yScaleWidth){
      options["afterFit"] = (scale => {
        scale.width = this.yScaleWidth;
      });
    }

    this.options.scales["yAxes"] = [options];
  }

  initToolTips(){
    let _this = this;

    this.options["tooltips"] = {
      callbacks: {
        label: function(tooltipItem: any, data: any) {
          var series = data.datasets[tooltipItem.datasetIndex];
          var allData = series.data;
          var tooltipData = allData[tooltipItem.index];

          let label = series.label + ": ";
          if(typeof(tooltipData) === 'object'){
            return label + tooltipData.y + _this.yUnits;
          }
          return label + tooltipData + _this.yUnits;
        }
      }
    };

    this.options["tooltips"]["enabled"] = this.enableToolTip;

    if(this.toolTipCallback){
      this.options["tooltips"]["enabled"] = false; // Disables default tooltip.
      this.options["tooltips"]["custom"] = this.toolTipCallback;
    }
  }
}