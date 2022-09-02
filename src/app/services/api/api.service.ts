import { Observable, of } from 'rxjs';

import { ConfigurationData } from 'src/app/configuration/configuration.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

    import(type = 'vpx'): Observable<Table[]> {
        return this.http.post(`${this.apiBase}/import/${type}`, {}) as Observable<Table[]>;
    }

    updateTable(id: number, body: Partial<Table>): Observable<boolean | string> {
        return this.http.post(`${this.apiBase}/table/${id}`, body) as Observable<boolean | string>;
    }

    export(): Observable<Table[]> {
        return this.http.post(`${this.apiBase}/export`, {}) as Observable<Table[]>;
    }

    getConfig(): Observable<ConfigurationData> {
        return this.http.get(`${this.apiBase}/config`) as Observable<ConfigurationData>;
    }

    updateConfig(configuration: ConfigurationData): Observable<boolean | string> {
        return this.http.post(`${this.apiBase}/config`, { ...configuration }) as Observable<boolean | string>;
    }
}
