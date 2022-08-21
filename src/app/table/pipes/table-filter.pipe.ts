import { Pipe, PipeTransform } from '@angular/core';

import { Table } from 'src/app/table/table.interface';

@Pipe({
    name: 'tableFilter',
})
export class TableFilterPipe implements PipeTransform {
    transform(tables: Table[] | null, filter: string): Table[] {
        if (!tables) {
            return [];
        }

        if (!filter) {
            return tables;
        }

        return tables.filter(t => t.description.toLocaleLowerCase().includes(filter));
    }
}
