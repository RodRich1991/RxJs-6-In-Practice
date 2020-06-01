import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, timer } from "rxjs";
import { Course } from "../model/course";
import { createHttpObservable } from "./util";
import { tap, map, shareReplay, retryWhen, delayWhen } from "rxjs/operators";
import { fromPromise } from "rxjs/internal-compatibility";

@Injectable({ providedIn: 'root'})
export class StoreService {
    [x: string]: any;
    
    private subject = new BehaviorSubject<Course[]>([]);

    public courses$: Observable<Course[]> = this.subject.asObservable();

    init(): void {
        const http$ = createHttpObservable('/api/courses');

        http$
            .pipe(
                map(res => Object.values(res["payload"]) ),
                retryWhen(errors =>
                    errors.pipe(
                    delayWhen(() => timer(2000)
                    )
                ) )
            )
            .subscribe(courses => this.subject.next(courses));
    }

    getBeginnerCourses() {
        return this.filterByCategory('BEGINNER');
    }

    getAdvancedCourses() {
        return this.filterByCategory('ADVANCED');
    }
    
    findOne(courseId: number): Observable<Course> {
        return this.courses$
            .pipe(
                map(courses => courses.find(course => course.id == courseId))
            );
    }

    private filterByCategory(category: string) {
        return this.courses$
        .pipe(
            map(courses => courses
                .filter(course => course.category == category))
        );
    }

    saveCourse(courseId: number, changes: object): Observable<any> {
        const courseIndex = this.subject.value.findIndex(course => course.id === courseId);
        const newCourses = this.subject.getValue().slice(0);

        newCourses[courseIndex] = {
            ...newCourses[courseIndex],
            ...changes
        };
        this.subject.next(newCourses);

        return fromPromise(fetch(`/api/courses/${courseId}`, {
            method: 'PUT',
            body: JSON.stringify(changes),
            headers: {
                'content-type': 'application/json'
            }
        }))

    }

}