import { ApiService } from 'src/app/services/api/api.service';
import { Component } from '@angular/core';
import { Table } from 'src/app/table/table.interface';

@Component({
    selector: 'app-import',
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.scss'],
})
export class ImportComponent {
    results: number = 0;

    constructor(
        private api: ApiService,
    ) {}

    import() {
        this.api.import().subscribe((tables: Table[]) => {
            this.results = tables.length;
        });
    }

    clear() {
        this.results = 0;
    }
}
