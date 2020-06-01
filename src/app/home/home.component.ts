import {Component, OnInit} from '@angular/core';
import {Course} from "../model/course";
import {interval, noop, Observable, of, throwError, timer} from 'rxjs';
import {catchError, delay, delayWhen, finalize, map, retryWhen, shareReplay, tap} from 'rxjs/operators';
import {createHttpObservable} from '../common/util';
import { StoreService } from '../common/store.service';


@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    beginnerCourses$: Observable<Course[]>;

    advancedCourses$: Observable<Course[]>;

    constructor(private store: StoreService) {

    }

    ngOnInit() {

        const http$ = createHttpObservable('/api/courses');

        this.beginnerCourses$ = this.store.getBeginnerCourses();
        this.advancedCourses$ = this.store.getAdvancedCourses();
    }

}
