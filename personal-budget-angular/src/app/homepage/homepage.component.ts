import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';
import * as d3 from 'd3';
import { ServiceService } from '../service.service';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements AfterViewInit {

  public data = {
      datasets: [
          {
              data: [],
              backgroundColor: [
                '#ffcd56',
                '#ff6384',
                '#36a2eb',
                '#fd6b19',
                '#36a2eb',
                '#ffcd56',
                '#0000ff',
              ],
          }
      ],
      labels: []
    };

  // constructor(private http: HttpClient) { }
  constructor(public serviceService: ServiceService) { }

  getChart(): void {
    var color = d3.scale.ordinal()
    .domain(this.data.labels)
    .range(this.data.datasets[0].backgroundColor);
    var svg = d3.select("#dochart")
    .append("svg")
    .append("g")

    svg.append("g")
      .attr("class", "slices");
    svg.append("g")
      .attr("class", "labels");
    svg.append("g")
      .attr("class", "lines");

    var width = 960;
    var height = 450;
    var radius = Math.min(width, height) / 2;

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) {
          return d.value;
      });

    var arc = d3.svg.arc()
      .outerRadius(radius * 0.8)
      .innerRadius(radius * 0.4);

    var outerArc = d3.svg.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var key = function(d){ return d.data.label; };
    // Creating the Donut chart with the budget.json file data stored in the variable data
    this.doChart(this.getbudget(this.data, color), color, arc, outerArc, radius,svg,pie,key);
  }

  ngAfterViewInit(): void {
      this.serviceService.getData().subscribe((data) => {
        let titleArr = [];
        let budgetArr = [];
        data.adityabudget.map((item)=>{
          titleArr.push(item.title);
          budgetArr.push(item.budget);
        })
        this.data.datasets[0].data = budgetArr;
        this.data.labels = titleArr;
        this.createChart();
        this.getChart();
      });
  }

  createChart(): void {
    const ctx = document.getElementById('myChart');
    const myPieChart = new Chart(ctx, {
        type: 'pie',
        data: this.data
    });
  }

  getbudget(data, color){
    var labels = color.domain();
    var i=0;
    return labels.map(function(label){
        return { label: label, value: data.datasets[0].data[i++] }
    });
  }

  doChart(data,color,arc,outerArc,radius,svg,pie,key): void {
    /* ------- PIE SLICES -------*/
    var slice = svg.select(".slices").selectAll("path.slice")
      .data(pie(data), key);

    slice.enter()
      .insert("path")
      .style("fill", function(d) { return color(d.data.label); })
      .attr("class", "slice");

    slice
      .transition().duration(1000)
      .attrTween("d", function(d) {
          this._current = this._current || d;
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          return function(t) {
              return arc(interpolate(t));
          };
      })

    slice.exit()
      .remove();

    /* ------- TEXT LABELS -------*/

    var text = svg.select(".labels").selectAll("text")
      .data(pie(data), key);

    text.enter()
      .append("text")
      .attr("dy", ".35em")
      .text(function(d) {
          return d.data.label;
      });

    function midAngle(d){
      return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text.transition().duration(1000)
      .attrTween("transform", function(d) {
          this._current = this._current || d;
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          return function(t) {
              var d2 = interpolate(t);
              var pos = outerArc.centroid(d2);
              pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
              return "translate("+ pos +")";
          };
      })
      .styleTween("text-anchor", function(d){
          this._current = this._current || d;
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          return function(t) {
              var d2 = interpolate(t);
              return midAngle(d2) < Math.PI ? "start":"end";
          };
      });

    text.exit()
      .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = svg.select(".lines").selectAll("polyline")
      .data(pie(data), key);

    polyline.enter()
      .append("polyline");

    polyline.transition().duration(1000)
      .attrTween("points", function(d){
          this._current = this._current || d;
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          return function(t) {
              var d2 = interpolate(t);
              var pos = outerArc.centroid(d2);
              pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
              return [arc.centroid(d2), outerArc.centroid(d2), pos];
          };
      });
    polyline.exit()
      .remove();
    }

}
