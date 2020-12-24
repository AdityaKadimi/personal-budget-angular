import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';
import * as D3 from 'd3';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  public dataSource = {
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],

    labels: [],
  };

  public loggedInUserName: any;

  constructor(private _dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.loggedInUserName = this._dataService.loggedInUserName;
    this._dataService
      .getBudgetData(this.loggedInUserName)
      .subscribe((res: any) => {
        // console.log(res);
        for (let i = 0; i < res.length; i++) {
          this.dataSource.datasets[0].data[i] = res[i].budget;
          this.dataSource.labels[i] = res[i].title;
          this.dataSource.datasets[0].backgroundColor[i] = res[i].color;
          this.createChart();
        }
      });
  }

  createChart() {
    var ctx: any = document.getElementById('myChart');
    var myPieChart = new Chart(ctx, {
      type: 'pie',
      data: this.dataSource,
    });
  }

  navigateToAddBudget() {
    this.router.navigate(['/addbudget']);
  }

  callNgOnInit() {
    this.ngOnInit();
  }
}
