import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';

import { ApiService } from 'src/app/services/api/api.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { STATS_COLUMNS } from 'src/app/database/database.constants';
import { Stats } from 'src/app/database/database.interface';
import { tap } from 'rxjs';

@Component({
    selector: 'app-stats',
    templateUrl: './stats.component.html',
    styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
    @ViewChild('tableSort') tableSort = new MatSort();
    @ViewChild(MatPaginator) tablePaginator!: MatPaginator;

    tableData$: any;
    tableDataSource!: MatTableDataSource<any>;
    columns: any[] = [];
    displayedColumns: string[] = [];
    sortedData: any[] = [];

    constructor(
        private api: ApiService,
    ) {}

    ngOnInit(): void {
        this.tableData$ = this.api.getStats().pipe(
            tap((data: Stats[]) => {
                this.tableDataSource.data = data;
                this.tableDataSource.sort = this.tableSort;
                this.tableDataSource.paginator = this.tablePaginator;
            })
        );
        this.columns = STATS_COLUMNS;
        this.tableDataSource = new MatTableDataSource(this.tableData$);
        this.displayedColumns = this.columns.map(c => c.columnDef);
        this.displayedColumns = this.displayedColumns.concat(['actions']);
}

    async sortData(sort: Sort) {
        if (!sort.active || sort.direction === '') {
            return;
        }

        this.sortedData = this.tableDataSource.data.sort((a: any, b: any) => {
            return this.compare(a[sort.active], b[sort.active], sort.direction === 'asc');
        });
    }

    delete(row: any) {
        // // Delete record
        // this.db.deleteRecord(this.currentTableName, row.id).subscribe(() => {
        //     // Filter record
        //     this.tableData$ = this.tableData$.pipe(filter((result: any) => result.id !== row.id));
        // });
    }

    private compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
