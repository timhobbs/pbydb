import { Component, OnInit } from '@angular/core';

import { ApiService } from 'src/app/services/api/api.service';
import { Table } from 'src/app/table/table.interface';

@Component({
    selector: 'app-export',
    templateUrl: './export.component.html',
    styleUrls: ['./export.component.scss'],
})
export class ExportComponent {
    results: number = 0;

    constructor(
        private api: ApiService,
    ) {}

    export() {
        this.api.export().subscribe((tables: Table[]) => {
            this.results = tables.length;
        });
    }

    clear() {
        this.results = 0;
    }
}
