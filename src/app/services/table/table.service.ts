import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TableService {
    private count$ = new BehaviorSubject<number>(0);

    constructor() {}

    getTableCount() {
        return this.count$.asObservable();
    }

    setTableCount(count: number) {
        this.count$.next(count);
    }
}
