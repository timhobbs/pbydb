import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { ApiService } from 'src/app/services/api/api.service';
import { Observable } from 'rxjs';
import { Table } from 'src/app/table/table.interface';
import { TableService } from 'src/app/services/table/table.service';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
    tables$: Observable<Table[]> | undefined;
    filter: string = '';
    viewType = 'list';
    filteredTablesCount$: Observable<number> | undefined;

    constructor(
        private api: ApiService,
        private tableService: TableService,
        private changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.tables$ = this.api.getTables();
        this.filteredTablesCount$ = this.tableService.getTableCount();
    }

    clearFilter() {
        this.filter = '';
    }

    setView(type: string) {
        this.viewType = type;
    }

    filterChanged() {
        this.changeDetectorRef.detectChanges();
    }
}
