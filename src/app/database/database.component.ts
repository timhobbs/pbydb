import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { Observable, filter, map, tap } from 'rxjs';

import { ApiService } from 'src/app/services/api/api.service';
import { ConfigurationData } from 'src/app/configuration/configuration.interface';
import { ConfigurationService } from 'src/app/services/configuration/configuration.service';
import { DatabaseList } from 'src/app/database/database.interface';
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
                this.columns = [
                    {
                        columnDef: 'id',
                        header: 'ID',
                        cell: (element: ConfigurationData) => `${element.id}`,
                        css: 'w10pc',
                    },
                    {
                        columnDef: 'vpxdb',
                        header: 'VPX Db',
                        cell: (element: ConfigurationData) => `${element.vpxdb}`,
                        css: 'w45pc',
                    },
                    {
                        columnDef: 'vpxtables',
                        header: 'VPS Tables',
                        cell: (element: ConfigurationData) => `${element.vpxtables}`,
                        css: 'w45pc',
                    },
                ];
                break;
            case 'tables':
                this.tableData$ = this.api.getTables().pipe(
                    tap((data: Table[]) => {
                        this.tableDataSource.data = data;
                        this.tableDataSource.sort = this.tableSort;
                        this.tableDataSource.paginator = this.tablePaginator;
                    })
                );
                this.columns = [
                    {
                        columnDef: 'id',
                        header: 'ID',
                        cell: (element: Table) => `${element.id}`,
                        css: 'w5pc',
                    },
                    {
                        columnDef: 'name',
                        header: 'Name',
                        cell: (element: Table) => `${element.name}`,
                        css: 'w15pc',
                    },
                    {
                        columnDef: 'description',
                        header: 'Description',
                        cell: (element: Table) => `${element.description}`,
                        css: 'w15pc',
                    },
                    {
                        columnDef: 'type',
                        header: 'Type',
                        cell: (element: Table) => `${element.type}`,
                        css: 'w5pc',
                    },
                    {
                        columnDef: 'rom',
                        header: 'ROM',
                        cell: (element: Table) => `${element.rom}`,
                        css: 'w5pc',
                    },
                    {
                        columnDef: 'manufacturer',
                        header: 'Manufacturer',
                        cell: (element: Table) => `${element.manufacturer}`,
                        css: 'w15pc',
                    },
                    {
                        columnDef: 'year',
                        header: 'Year',
                        cell: (element: Table) => `${element.year}`,
                        css: 'w5pc',
                    },
                    {
                        columnDef: 'rating',
                        header: 'Rating',
                        cell: (element: Table) => `${element.rating}`,
                        css: 'w5pc',
                    },
                    {
                        columnDef: 'ipdbid',
                        header: 'IPDB ID',
                        cell: (element: Table) => `${element.ipdbid}`,
                        css: 'w5pc',
                    },
                    {
                        columnDef: 'vpsid',
                        header: 'VPS ID',
                        cell: (element: Table) => `${element.vpsid}`,
                        css: 'w5pc',
                    },
                    {
                        columnDef: 'b2s',
                        header: 'B2S',
                        cell: (element: Table) => `${element.b2s}`,
                        css: 'w10pc',
                    },
                    {
                        columnDef: 'haspup',
                        header: 'Has Pup?',
                        cell: (element: Table) => `${element.haspup}`,
                        css: 'w5pc',
                    },
                ];
                break;
            case 'vpslookup':
                this.tableData$ = this.db.getVpslookup().pipe(
                    tap((data: Vpslookup[]) => {
                        this.tableDataSource.data = data;
                        this.tableDataSource.sort = this.tableSort;
                        this.tableDataSource.paginator = this.tablePaginator;
                    })
                );
                this.columns = [
                    {
                        columnDef: 'id',
                        header: 'ID',
                        cell: (element: Vpslookup) => `${element.id}`,
                        css: 'w2-5pc',
                    },
                    {
                        columnDef: 'GameFileName',
                        header: 'Game File Name',
                        cell: (element: Vpslookup) => `${element.GameFileName}`,
                        css: 'w10pc',
                    },
                    {
                        columnDef: 'GameName',
                        header: 'Game Name',
                        cell: (element: Vpslookup) => `${element.GameName}`,
                        css: 'w10pc',
                    },
                    {
                        columnDef: 'GameDisplay',
                        header: 'Game Display',
                        cell: (element: Vpslookup) => `${element.GameDisplay}`,
                        css: 'w2-5pc',
                    },
                    {
                        columnDef: 'MediaSearch',
                        header: 'Media Search',
                        cell: (element: Vpslookup) => `${element.MediaSearch}`,
                        css: 'w2-5pc',
                    },
                    {
                        columnDef: 'Manufact',
                        header: 'Manufacturer',
                        cell: (element: Vpslookup) => `${element.Manufact}`,
                        css: 'w5pc',
                    },
                    {
                        columnDef: 'GameYear',
                        header: 'Game Year',
                        cell: (element: Vpslookup) => `${element.GameYear}`,
                        css: 'w2-5pc',
                    },
                    {
                        columnDef: 'NumPlayers',
                        header: 'Num Players',
                        cell: (element: Vpslookup) => `${element.NumPlayers}`,
                        css: 'w2-5pc',
                    },
                    {
                        columnDef: 'GameType',
                        header: 'Game Type',
                        cell: (element: Vpslookup) => `${element.GameType}`,
                        css: 'w2-5pc',
                    },
                    {
                        columnDef: 'Category',
                        header: 'Category',
                        cell: (element: Vpslookup) => `${element.Category}`,
                        css: 'w5pc',
                    },
                    {
                        columnDef: 'GameTheme',
                        header: 'Game Theme',
                        cell: (element: Vpslookup) => `${(element.GameTheme ?? '').split(',')}`,
                        css: 'w5pc',
                    },
                    {
                        columnDef: 'WebLinkURL',
                        header: 'Web Link URL',
                        cell: (element: Vpslookup) => `${element.WebLinkURL}`,
                        css: 'w10pc',
                    },
                    {
                        columnDef: 'IPDBNum',
                        header: 'IPDB#',
                        cell: (element: Vpslookup) => `${element.IPDBNum}`,
                        css: 'w2-5pc',
                    },
                    {
                        columnDef: 'AltRunMode',
                        header: 'Alt Run Mode',
                        cell: (element: Vpslookup) => `${element.AltRunMode}`,
                        css: 'w2-5pc',
                    },
                    {
                        columnDef: 'DesignedBy',
                        header: 'Designed By',
                        cell: (element: Vpslookup) => `${(element.DesignedBy ?? '').split(',')}`,
                        css: 'w5pc',
                    },
                    {
                        columnDef: 'Author',
                        header: 'Author',
                        cell: (element: Vpslookup) => `${(element.Author ?? '').split(',')}`,
                        css: 'w5pc',
                    },
                    {
                        columnDef: 'GAMEVER',
                        header: 'Game Version',
                        cell: (element: Vpslookup) => `${element.GAMEVER}`,
                        css: 'w2-5pc',
                    },
                    {
                        columnDef: 'Rom',
                        header: 'ROM',
                        cell: (element: Vpslookup) => `${element.Rom}`,
                        css: 'w2-5pc',
                    },
                    {
                        columnDef: 'Tags',
                        header: 'Tags',
                        cell: (element: Vpslookup) => `${(element.Tags ?? '').split(',')}`,
                        css: 'w2-5pc',
                    },
                    {
                        columnDef: 'VPSID',
                        header: 'VPS ID',
                        cell: (element: Vpslookup) => `${element.VPSID}`,
                        css: 'w2-5pc',
                    },
                ];
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
