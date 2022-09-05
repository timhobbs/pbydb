import { Component, OnInit } from '@angular/core';

import { ApiService } from 'src/app/services/api/api.service';
import { DbService } from 'src/app/services/db/db.service';
import { Observable } from 'rxjs';

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

    constructor(
        private api: ApiService,
        private db: DbService,
    ) {}

    ngOnInit(): void {
        this.dbTotal$ = this.db.getTotal();
        this.dbStatus$ = this.db.getStatus();
        this.db.getProcessedRecords().subscribe(processed => this.processed = processed);
    }

    import(type = 'vpx') {
        const file = this.fileInput ?? null;
        this.api.import(type, file).subscribe((tables: any[]) => {
            if (type === 'vpx') {
                this.results = tables.length;
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
