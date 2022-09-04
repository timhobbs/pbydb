import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { Observable, map, tap } from 'rxjs';

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
                    },
                    {
                        columnDef: 'vpxdb',
                        header: 'VPX Db',
                        cell: (element: ConfigurationData) => `${element.vpxdb}`,
                    },
                    {
                        columnDef: 'vpxtables',
                        header: 'VPS Tables',
                        cell: (element: ConfigurationData) => `${element.vpxtables}`,
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
                    },
                    {
                        columnDef: 'name',
                        header: 'Name',
                        cell: (element: Table) => `${element.name}`,
                    },
                    {
                        columnDef: 'description',
                        header: 'Description',
                        cell: (element: Table) => `${element.description}`,
                    },
                    {
                        columnDef: 'type',
                        header: 'Type',
                        cell: (element: Table) => `${element.type}`,
                    },
                    {
                        columnDef: 'rom',
                        header: 'ROM',
                        cell: (element: Table) => `${element.rom}`,
                    },
                    {
                        columnDef: 'manufacturer',
                        header: 'Manufacturer',
                        cell: (element: Table) => `${element.manufacturer}`,
                    },
                    {
                        columnDef: 'year',
                        header: 'Year',
                        cell: (element: Table) => `${element.year}`,
                    },
                    {
                        columnDef: 'rating',
                        header: 'Rating',
                        cell: (element: Table) => `${element.rating}`,
                    },
                    {
                        columnDef: 'ipdbid',
                        header: 'IPDB ID',
                        cell: (element: Table) => `${element.ipdbid}`,
                    },
                    {
                        columnDef: 'vpsid',
                        header: 'VPS ID',
                        cell: (element: Table) => `${element.vpsid}`,
                    },
                    {
                        columnDef: 'b2s',
                        header: 'B2S',
                        cell: (element: Table) => `${element.b2s}`,
                    },
                    {
                        columnDef: 'haspup',
                        header: 'Has Pup?',
                        cell: (element: Table) => `${element.haspup}`,
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
                    },
                    {
                        columnDef: 'GameFileName',
                        header: 'VGameFileNamePXDb',
                        cell: (element: Vpslookup) => `${element.GameFileName}`,
                    },
                    {
                        columnDef: 'GameName',
                        header: 'GameName',
                        cell: (element: Vpslookup) => `${element.GameName}`,
                    },
                    {
                        columnDef: 'GameDisplay',
                        header: 'GameDisplay',
                        cell: (element: Vpslookup) => `${element.GameDisplay}`,
                    },
                    {
                        columnDef: 'MediaSearch',
                        header: 'MediaSearch',
                        cell: (element: Vpslookup) => `${element.MediaSearch}`,
                    },
                    {
                        columnDef: 'Manufact',
                        header: 'Manufact',
                        cell: (element: Vpslookup) => `${element.Manufact}`,
                    },
                    {
                        columnDef: 'GameYear',
                        header: 'GameYear',
                        cell: (element: Vpslookup) => `${element.GameYear}`,
                    },
                    {
                        columnDef: 'NumPlayers',
                        header: 'NumPlayers',
                        cell: (element: Vpslookup) => `${element.NumPlayers}`,
                    },
                    {
                        columnDef: 'GameType',
                        header: 'GameType',
                        cell: (element: Vpslookup) => `${element.GameType}`,
                    },
                    {
                        columnDef: 'Category',
                        header: 'Category',
                        cell: (element: Vpslookup) => `${element.Category}`,
                    },
                    {
                        columnDef: 'GameTheme',
                        header: 'GameTheme',
                        cell: (element: Vpslookup) => `${element.GameTheme?.split(',')}`,
                    },
                    {
                        columnDef: 'WebLinkURL',
                        header: 'WebLinkURL',
                        cell: (element: Vpslookup) => `${element.WebLinkURL}`,
                    },
                    {
                        columnDef: 'IPDBNum',
                        header: 'IPDBNum',
                        cell: (element: Vpslookup) => `${element.IPDBNum}`,
                    },
                    {
                        columnDef: 'AltRunMode',
                        header: 'AltRunMode',
                        cell: (element: Vpslookup) => `${element.AltRunMode}`,
                    },
                    {
                        columnDef: 'DesignedBy',
                        header: 'DesignedBy',
                        cell: (element: Vpslookup) => `${element.DesignedBy?.split(',')}`,
                    },
                    {
                        columnDef: 'Author',
                        header: 'Author',
                        cell: (element: Vpslookup) => `${element.Author.split(',')}`,
                    },
                    {
                        columnDef: 'GAMEVER',
                        header: 'GAMEVER',
                        cell: (element: Vpslookup) => `${element.GAMEVER}`,
                    },
                    {
                        columnDef: 'Rom',
                        header: 'Rom',
                        cell: (element: Vpslookup) => `${element.Rom}`,
                    },
                    {
                        columnDef: 'Tags',
                        header: 'Tags',
                        cell: (element: Vpslookup) => `${element.Tags?.split(',')}`,
                    },
                    {
                        columnDef: 'VPSID',
                        header: 'VPSID',
                        cell: (element: Vpslookup) => `${element.VPSID}`,
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
        this.sqlResult$ = this.db.executeSql(sql)
    }

    clearSql() {
        this.sqlResult$ = null;
    }

    delete(row: any) {
        console.log('***** row', row);

        // Delete record

        // Filter results
    }

    private compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
