import { Component, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiService } from 'src/app/services/api/api.service';
import { DbService } from 'src/app/services/db/db.service';

@Component({
    selector: 'app-import',
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.scss'],
})
export class ImportComponent implements OnInit {
    results = 0;
    fileInput: File | null = null;
    dbTotal$: Observable<any> | undefined;
    dbStatus$: Observable<any> | undefined;
    processed = 0;
    totalImported = 0;
    incomplete = false;

    constructor(
        private api: ApiService,
        private db: DbService,
    ) {}

    ngOnInit(): void {
        this.dbTotal$ = this.db.getTotal().pipe(tap((total: number) => this.totalImported = total));
        this.dbStatus$ = this.db.getStatus();
        this.db.getProcessedRecords().subscribe(processed => this.processed = processed);
        this.db.getProcessedTotal().subscribe(total => {
            this.incomplete = this.totalImported > total;
        });
    }

    import(type = 'vpx') {
        const file = this.fileInput ?? null;
        this.api.import(type, file).subscribe((results: any) => {
            if (type === 'vpx') {
                this.results = results.length;
            }
        });
    }

    clear() {
        this.results = 0;
    }

    fileChanged($event: any) {
        this.fileInput = $event.target.files[0] ?? null;
    }
}
