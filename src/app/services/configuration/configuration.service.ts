import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ConfigurationService {
    private appSettings: Record<string, any> | undefined;

    constructor() {}

    load() {
        return new Promise((resolve, reject) => {
            try {
                const envSettings = sessionStorage.getItem('appSettings');
                this.appSettings = JSON.parse(envSettings ?? '{}');
                resolve(true);
            } catch (err) {
                reject(err);
            }
        })
    }

    get() {
        return this.appSettings;
    }

    getValue(key: string) {
        return (this.appSettings ?? {})[key];
    }
}
