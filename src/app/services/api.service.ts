import { ConfigurationData } from 'src/app/configuration/configuration.interface';
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

    import(): Observable<Table[]> {
        return this.http.post(`${this.apiBase}/import`, {}) as Observable<Table[]>;
    }

    updateTable(id: number, body: Partial<Table>): Observable<boolean> {
        return this.http.post(`${this.apiBase}/table/${id}`, body) as Observable<boolean>;
    }

    export(): Observable<Table[]> {
        return this.http.post(`${this.apiBase}/export`, {}) as Observable<Table[]>;
    }

    getConfig(): Observable<ConfigurationData[]> {
        return this.http.get(`${this.apiBase}/config`, {}) as Observable<ConfigurationData[]>;
    }
}
