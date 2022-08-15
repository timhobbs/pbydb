import { Component, OnInit } from '@angular/core';

import { ApiService } from 'src/app/services/api.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
    tables$: Observable<any> | undefined;

    constructor(
        private api: ApiService,
    ) {}

    ngOnInit(): void {
        this.tables$ = this.api.getTables();
    }
}
