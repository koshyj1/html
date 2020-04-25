import { Component, OnInit, Input } from '@angular/core';
import { LineChartComponent } from '../line-chart/line-chart.component';

@Component({
  selector: 'app-scatter-chart',
  templateUrl: './scatter-chart.component.html',
  styleUrls: ['./scatter-chart.component.scss']
})
export class ScatterChartComponent extends LineChartComponent implements OnInit {
  public options: object = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {},
    scales: {
      xAxes: [{
          type: 'linear',
          position: 'bottom'
      }]
    },
    tooltips: {}
  };

  ngOnInit(){
    // Init line chart component.
    super.ngOnInit();
    
    this.options["scales"] = (this.options["scales"] != undefined) ? this.options["scales"] : {};
    this.options["scales"].xAxes = (this.options["scales"].xAxes != undefined) ? this.options["scales"].xAxes : [{}];
    this.options["scales"].xAxes[0].type = 'linear';
    this.options["scales"].xAxes[0].position = 'bottom';
  }
}
