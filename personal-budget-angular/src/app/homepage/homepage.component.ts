import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  public data =  {
    datasets : [
        {
            data : [],
            backgroundColor:[
                '#ffcd56',
                '#ff6384',
                '#36a2eb',
                '#fd6b19',
                '#36a2eb',
                '#ffcd56',
                '#ff6384',
            ]
        }
   ],
    labels: []
};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get('http://localhost:3000/budget')
    .subscribe((res: any) => {
        for (var i = 0; i < res.adityabudget.length; i++) {
        this.data.datasets[0].data[i] = res.adityabudget[i].budget;
        this.data.labels[i] = res.adityabudget[i].title;
        this.createChart();
      }


    });
  }
  createChart()
        {
        // var ctx = document.getElementById("myChart").getContext("2d");
        var ctx = document.getElementById('myChart');
        var myPieChart = new Chart(ctx, {
            type: 'pie',
            data: this.data,
        });
        }

}
