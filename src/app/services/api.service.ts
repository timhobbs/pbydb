import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Table } from 'src/app/table/table.interface';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private apiBase = `/api`;

    constructor(
        private http: HttpClient,
    ) {}

    getTables(): Observable<Table[]> {
        return this.http.get(`${this.apiBase}/table`) as Observable<Table[]>;
    }

    getTable(id: number): Observable<Table[]> {
        return this.http.get(`${this.apiBase}/table/${id}`) as Observable<Table[]>;
    }
}
