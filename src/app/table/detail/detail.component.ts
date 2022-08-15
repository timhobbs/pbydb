import { ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { ApiService } from 'src/app/services/api.service';
import { Observable } from 'rxjs';
import { Table } from 'src/app/table/table.interface';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
    table$: Observable<Table[]> | undefined;
    result: Table | undefined;

    constructor(
        private api: ApiService,
        private activatedRoute: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
            this.table$ = this.api.getTable(Number(params.get('id')));
        })
    }

    change($event: any, table: Table) {
        console.log('change', $event, table);
        table.rating = $event.rating;
    }

    submit(table: Table) {
        this.result = table;
    }

    clear() {
        this.result = void 0;
    }
}
