import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { shareReplay, takeUntil } from 'rxjs/operators';

import { getLocaleDateFormat } from '@angular/common';
//import { Data } from '@angular/router';
import { BudgetSchema } from './models/budget.js';
import { FeedbackSchema } from './models/feedback.js';
import { UserSchema } from './models/user.js';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { local } from 'd3';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  DataObservable: Observable<any>;
  // UserObservable : Observable<any>;

  budgetData: Observable<BudgetSchema[]>;

  feedbackData: Observable<FeedbackSchema[]>;

  userData: Observable<UserSchema[]>;

  isUserLoggedIn = new Subject<boolean>();
  timerId: any;
  isOpenModel = new Subject<boolean>();
  userRecord = {};
  logouthandler = true;
  loggedInUserName: any;

  constructor(
    private http: HttpClient,
    public router: Router,
    public toastr: ToastrService
  ) {
    this.isOpenModel.next(false);
  }
  // An if-else statment where we are populating an Observable and checking it before out API call.
  // If it's empty only then call to API is made.
  // If not then data is read from the Observable.
  // tslint:disable-next-line: typedef
  getBudgetData(username): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const body = JSON.stringify(username);
    const headers = {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    this.DataObservable = this.http
      .get('https://personal-budget-backend-aditya.herokuapp.com/budget', {
        headers: headers,
        params: { userid: username },
      })
      .pipe(shareReplay());
    //this.DataObservable = this.http.get('https://personal-budget-backend-aditya.herokuapp.com/budget',{ headers: headers }).pipe(shareReplay());
    return this.DataObservable;
  }

  addBudgetdata(data: BudgetSchema) {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const body = JSON.stringify(data);
    // // console.log(body);
    return this.http.post(
      'https://personal-budget-backend-aditya.herokuapp.com/budget',
      body,
      {
        headers: headers,
      }
    );
    //return this.http.post('https://personal-budget-backend-aditya.herokuapp.com/budget',body,{'headers':headers});
  }

  addFeedbackData(data: FeedbackSchema) {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const body = JSON.stringify(data);
    // console.log(body);
    return this.http.post(
      'https://personal-budget-backend-aditya.herokuapp.com/feedback',
      body,
      {
        headers: headers,
      }
    );
    //return this.http.post('https://personal-budget-backend-aditya.herokuapp.com/feedback',body,{'headers':headers});
  }

  userRegister(data: UserSchema) {
    const headers = { 'content-type': 'application/json' };
    const body = JSON.stringify(data);
    // console.log(body);
    return this.http.post(
      'https://personal-budget-backend-aditya.herokuapp.com/users',
      body,
      {
        headers: headers,
      }
    );
  }

  invaliduser() {
    this.toastr.error(
      'User does not exist. Please proceed to Register page',
      'Error'
    );
  }

  userLogin(data: UserSchema) {
    const headers = { 'content-type': 'application/json' };
    const body = JSON.stringify(data);
    // console.log(body);
    return this.http
      .post('https://personal-budget-backend-aditya.herokuapp.com/auth', body, {
        headers: headers,
      })
      .subscribe(
        (res: any) => {
          // console.log(res);
          this.userRecord['username'] = data.username;
          this.userRecord['password'] = data.password;
          //console.log('user record is ' + JSON.stringify(this.userRecord));
          this.loggedInUserName = data.username;
          localStorage.setItem('accessToken', res.token);
          localStorage.setItem('exp', res.exp);
          this.isUserLoggedIn.next(true);
          this.router.navigate(['/homepage']);
          this.setTimer(true);
        },
        (err) => {
          this.invaliduser();
        }
      );
  }

  successfulLogout() {
    this.toastr.success('You have logged out successfully', 'Goodbye!');
  }

  public setTimer(flag) {
    // console.log('Timer set');
    if (flag) {
      this.timerId = setInterval(() => {
        const exp = localStorage.getItem('exp');
        const expdate = new Date(0).setUTCSeconds(Number(exp));
        const TokenNotExpired = expdate.valueOf() > new Date().valueOf();
        const lessThanTwentySecRemaining =
          expdate.valueOf() - new Date().valueOf() <= 20000;
        // console.log(
        //   lessThanTwentySecRemaining +
        //     ' ' +
        //     TokenNotExpired +
        //     ' ' +
        //     this.logouthandler
        // );

        if (
          TokenNotExpired &&
          lessThanTwentySecRemaining &&
          this.logouthandler
        ) {
          let message = confirm(
            'Your session is going to expire in 20 seconds! click OK to extend the session!'
          );
          if (message && this.logouthandler) {
            // console.log('okay clicked');
            let record = {};
            record['username'] = this.userRecord['username'];
            record['password'] = this.userRecord['password'];
            //console.log(JSON.stringify(record));
            this.logouthandler = true;
            this.userLogin(record);
          } else {
            //console.log('Cancel clicked. So Session will continue');
            message = false;
            this.logouthandler = false;
          }
        }
        if (new Date().valueOf() >= expdate.valueOf()) {
          clearInterval(this.timerId);
          this.logout();
          this.successfulLogout();
          //console.log('clear interval');
          return;
        }
      }, 20000);
    } else {
      clearInterval(this.timerId);
      //this.successfulLogout();
    }
  }

  public logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('exp');
    this.loggedInUserName = '';
    this.isUserLoggedIn.next(false);
    this.router.navigate(['/login']);
  }

  public getLoginStatus(): Observable<boolean> {
    return this.isUserLoggedIn;
  }

  verifyTokenPresence() {
    return !!localStorage.getItem('token');
  }
}
