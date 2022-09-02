import { Pipe, PipeTransform } from '@angular/core';

import { Table } from 'src/app/table/table.interface';
import { TableService } from 'src/app/services/table/table.service';

@Pipe({
    name: 'tableFilter',
})
export class TableFilterPipe implements PipeTransform {
    constructor(
        private tableService: TableService,
    ) {}

    transform(tables: Table[] | null, filter: string): Table[] {
        if (!tables) {
            return [];
        }

        if (!filter) {
            this.tableService.setTableCount(tables.length);

            return tables;
        }

        const filtered = tables.filter(t => t.description.toLocaleLowerCase().includes(filter));
        this.tableService.setTableCount(filtered.length);

        return filtered;
    }
}
