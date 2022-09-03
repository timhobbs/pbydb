import { ApiService } from 'src/app/services/api/api.service';
import { Component } from '@angular/core';
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

    constructor(
        private api: ApiService,
    ) {}

    import(type = 'vpx') {
        const file = this.fileInput ?? null;
        this.api.import(type, file).subscribe((tables: Table[]) => {
            this.results = tables.length;
        });
    }

    clear() {
        this.results = 0;
    }

    fileChanged($event: any) {
        this.fileInput = $event.target.files[0] ?? null;
    }
}
