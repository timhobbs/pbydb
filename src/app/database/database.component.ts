import { CONFIG_COLUMNS, STATS_COLUMNS, TABLE_COLUMNS, VPSLOOKUP_COLUMNS } from 'src/app/database/database.constants';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DatabaseList, Stats } from 'src/app/database/database.interface';
import { MatSort, Sort } from '@angular/material/sort';
import { Observable, filter, map, tap } from 'rxjs';

import { ApiService } from 'src/app/services/api/api.service';
import { ConfigurationData } from 'src/app/configuration/configuration.interface';
import { ConfigurationService } from 'src/app/services/configuration/configuration.service';
import { DbService } from 'src/app/services/db/db.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Table } from 'src/app/table/table.interface';
import { Vpslookup } from './database.interface';

@Component({
    selector: 'app-database',
    templateUrl: './database.component.html',
    styleUrls: ['./database.component.scss'],
})
export class DatabaseComponent implements OnInit {
    @ViewChild('tableSort') tableSort = new MatSort();
    @ViewChild(MatPaginator) tablePaginator!: MatPaginator;

    dbTables$!: Observable<DatabaseList[]>;
    treeControl!: FlatTreeControl<DatabaseList>;
    tableData$: any;
    tableDataSource!: MatTableDataSource<any>;
    columns: any[] = [];
    displayedColumns: string[] = [];
    sortedData: any[] = [];
    sqlResult$!: Observable<any> | null;
    currentTableName = '';
    enableAdvanced = false;
    sql = false;

    constructor(
        private db: DbService,
        private api: ApiService,
        private config: ConfigurationService,
    ) {}

    ngOnInit(): void {
        this.dbTables$ = this.db.getDatabaseTables();
        this.treeControl = new FlatTreeControl<DatabaseList>(() => 1, () => false);
        this.enableAdvanced = this.config.getValue('PBYDB_ENABLE_ADVANCED') === 'true';
    }

    async sortData(sort: Sort) {
        if (!sort.active || sort.direction === '') {
            return;
        }

        this.sortedData = this.tableDataSource.data.sort((a: any, b: any) => {
            return this.compare(a[sort.active], b[sort.active], sort.direction === 'asc');
        });
    }

    getData(tableName: string) {
        this.currentTableName = tableName;
        switch (tableName) {
            case 'config':
                this.tableData$ = this.api.getConfig().pipe(
                    map((data: ConfigurationData) => [data]),
                    tap((data: ConfigurationData[]) => {
                        this.tableDataSource.data = data;
                        this.tableDataSource.sort = this.tableSort;
                        this.tableDataSource.paginator = this.tablePaginator;
                    })
                ); // Return as array
                this.columns = CONFIG_COLUMNS;
                break;
            case 'tables':
                this.tableData$ = this.api.getTables().pipe(
                    tap((data: Table[]) => {
                        this.tableDataSource.data = data;
                        this.tableDataSource.sort = this.tableSort;
                        this.tableDataSource.paginator = this.tablePaginator;
                    })
                );
                this.columns = TABLE_COLUMNS;
                break;
            case 'vpslookup':
                this.tableData$ = this.db.getVpslookup().pipe(
                    tap((data: Vpslookup[]) => {
                        this.tableDataSource.data = data;
                        this.tableDataSource.sort = this.tableSort;
                        this.tableDataSource.paginator = this.tablePaginator;
                    })
                );
                this.columns = VPSLOOKUP_COLUMNS;
                break;
            case 'stats':
                this.tableData$ = this.db.getStats().pipe(
                    tap((data: Stats[]) => {
                        this.tableDataSource.data = data;
                        this.tableDataSource.sort = this.tableSort;
                        this.tableDataSource.paginator = this.tablePaginator;
                    })
                );
                this.columns = STATS_COLUMNS;
                break;
        }
        this.tableDataSource = new MatTableDataSource(this.tableData$);
        this.displayedColumns = this.columns.map(c => c.columnDef);
        if (this.currentTableName !== 'config') {
            this.displayedColumns = this.displayedColumns.concat(['actions']);
        }
    }

    clearData() {
        this.tableData$ = null;
    }

    execSql(sql: string) {
        this.sql = true;
        this.sqlResult$ = this.db.executeSql(sql);

        // Refresh tables when applicable
        if (sql.trim().startsWith('create') || sql.trim().startsWith('drop')) {
            setTimeout(() => {
                this.dbTables$ = this.db.getDatabaseTables();
            }, 100);
        }
    }

    clearSql() {
        this.sql = false;
        this.sqlResult$ = null;
    }

    delete(row: any) {
        // Delete record
        this.db.deleteRecord(this.currentTableName, row.id).subscribe(() => {
            // Filter record
            this.tableData$ = this.tableData$.pipe(filter((result: any) => result.id !== row.id));
        });
    }

    dropTable(tableName: string) {
        this.db.dropTable(tableName).subscribe(() => {});
        setTimeout(() => {
            location.reload();
        }, 100);
    }

    private compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
