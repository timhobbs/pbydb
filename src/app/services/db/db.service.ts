import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { DatabaseList, Vpslookup } from 'src/app/database/database.interface';

import { API_BASE } from 'src/app/app.constants';
import { HttpClient } from '@angular/common/http';
import { ImportVpslookupStatus } from 'src/app/import/import.constants';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
    providedIn: 'root',
})
export class DbService {
    private resolved: string[] = [];
    private rejected: string[] = [];
    private processed$ = new BehaviorSubject(0);

    get resolvedRecords() {
        return this.resolved;
    }

    get rejectedRecords() {
        return this.rejected;
    }

    constructor(
        private socket: Socket,
        private http: HttpClient,
    ) {}

    getTotal(): Observable<number> {
        return this.socket.fromEvent('record-total');
    }

    getStatus(): Observable<ImportVpslookupStatus> {
        return this.socket.fromEvent('record-status');
    }

    getProcessedRecords(): Observable<number> {
        return this.processed$.asObservable();
    }

    // Called via the process-status pipe
    addResolved(data: string): void {
        this.resolved.push(data);
        this.processed$.next(this.processed$.value + 1);
    }

    // Called via the process-status pipe
    addRejected(data: string): void {
        this.rejected.push(data);
        this.processed$.next(this.processed$.value + 1);
    }

    clearRecords(): void {
        this.resolved = [];
        this.rejected = [];
        this.processed$.complete();
        this.processed$ = new BehaviorSubject(0);
    }

    getDatabaseTables(): Observable<DatabaseList[]> {
        return this.http.get(`${API_BASE}/db`) as Observable<DatabaseList[]>;
    }

    getVpslookup(): Observable<Vpslookup[]> {
        return this.http.get(`${API_BASE}/vpslookup`) as Observable<Vpslookup[]>;
    }

    executeSql(sql: string): Observable<any> {
        return this.http.post(`${API_BASE}/sql`, { sql }) as Observable<any>;
    }

    deleteRecord(tableName: string, id: number): Observable<any[]> {
        return this.http.delete(`${API_BASE}/delete/${tableName}/${id}`) as Observable<any[]>;
    }

    dropTable(tableName: string) {
        return this.http.delete(`${API_BASE}/drop/${tableName}`) as Observable<any[]>;
    }
}
