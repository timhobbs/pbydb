import { HttpClient, HttpRequest } from '@angular/common/http';

import { ConfigurationData } from 'src/app/configuration/configuration.interface';
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

    import(type = 'vpx', file: File | null = null): Observable<Table[]> {
        const endpoint = `${this.apiBase}/import/${type}`;

        // If no file simply import the table data
        if (file === null) {
            return this.http.post(endpoint, {}) as Observable<Table[]>;
        }

        // Upload CSV file
        const formData = new FormData();
        formData.append('file', file);
        const req = new HttpRequest('POST', endpoint, formData, {
            reportProgress: true,
            responseType: 'json',
        });

        return this.http.request(req) as unknown as Observable<Table[]>;
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
