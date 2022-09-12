import { HttpClient, HttpRequest } from '@angular/common/http';

import { API_BASE } from 'src/app/app.constants';
import { ConfigurationData } from 'src/app/configuration/configuration.interface';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Table } from 'src/app/table/table.interface';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(
        private http: HttpClient,
    ) {}

    getTables(): Observable<Table[]> {
        return this.http.get(`${API_BASE}/table`) as Observable<Table[]>;
    }

    getTable(id: number): Observable<Table[]> {
        return this.http.get(`${API_BASE}/table/${id}`) as Observable<Table[]>;
    }

    import(type = 'vpx'): Observable<Table[]> {
        return this.http.post(`${API_BASE}/import/${type}`, {}) as Observable<Table[]>;
    }

    updateTable(id: number, body: Partial<Table>): Observable<boolean | string> {
        return this.http.post(`${API_BASE}/table/${id}`, body) as Observable<boolean | string>;
    }

    export(): Observable<Table[]> {
        return this.http.post(`${API_BASE}/export`, {}) as Observable<Table[]>;
    }

    getConfig(): Observable<ConfigurationData> {
        return this.http.get(`${API_BASE}/config`) as Observable<ConfigurationData>;
    }

    updateConfig(configuration: ConfigurationData): Observable<boolean | string> {
        return this.http.post(`${API_BASE}/config`, { ...configuration }) as Observable<boolean | string>;
    }
}
