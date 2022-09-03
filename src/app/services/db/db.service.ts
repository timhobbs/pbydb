import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
    providedIn: 'root',
})
export class DbService {
    private resolved: string[][] = [];
    private rejected: string[][] = [];
    private processed$ = new BehaviorSubject(0);

    get resolvedRecords() {
        return this.resolved;
    }

    get rejectedRecords() {
        return this.rejected;
    }

    constructor(
        private socket: Socket,
    ) {}

    getTotal() {
        return this.socket.fromEvent('record-total');
    }

    getStatus() {
        return this.socket.fromEvent('record-status');
    }

    getProcessedRecords() {
        return this.processed$.asObservable();
    }

    addResolved(data: string[]) {
        this.resolved.push(data);
        this.processed$.next(this.processed$.value + 1);
    }

    addRejected(data: string[]) {
        this.rejected.push(data);
        this.processed$.next(this.processed$.value + 1);
    }

    clearRecords() {
        this.resolved = [];
        this.rejected = [];
        this.processed$.complete();
        this.processed$ = new BehaviorSubject(0);
    }
}
