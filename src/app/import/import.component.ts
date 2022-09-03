import { ApiService } from 'src/app/services/api/api.service';
import { Component } from '@angular/core';
import { DbService } from 'src/app/services/db/db.service';
import { Observable } from 'rxjs';
import { Table } from 'src/app/table/table.interface';

@Component({
    selector: 'app-import',
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.scss'],
})
export class ImportComponent {
    results = 0;
    vpsResults = 0;
    fileInput: File | null = null;
    dbTotal$: Observable<any> | undefined;
    dbStatus$: Observable<any> | undefined;
    processed = 0;

    constructor(
        private api: ApiService,
        private db: DbService,
    ) {}

    import(type = 'vpx') {
        const file = this.fileInput ?? null;
        this.api.import(type, file).subscribe((tables: Table[]) => {
            this.results = tables.length;

            if (type === 'vps') {
                this.dbTotal$ = this.db.getTotal();
                this.dbStatus$ = this.db.getStatus();
                this.db.getProcessedRecords().subscribe(processed => this.processed = processed);
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
