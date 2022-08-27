import { Component, OnInit } from '@angular/core';

import { ApiService } from 'src/app/services/api.service';
import { Observable } from 'rxjs';
import { Table } from 'src/app/table/table.interface';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
    tables$: Observable<Table[]> | undefined;
    filter: string = '';
    viewType = 'list';

    constructor(
        private api: ApiService,
    ) {}

    ngOnInit(): void {
        this.tables$ = this.api.getTables();
    }

    clearFilter() {
        this.filter = '';
    }

    setView(type: string) {
        this.viewType = type;
    }
}
