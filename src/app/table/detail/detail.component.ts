import { ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { ApiService } from 'src/app/services/api/api.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Table } from 'src/app/table/table.interface';
import { VpsResultComponent } from 'src/app/table/vps-result/vps-result.component';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
    table$: Observable<Table[]> | undefined;

    constructor(
        private api: ApiService,
        private activatedRoute: ActivatedRoute,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
            this.table$ = this.api.getTable(Number(params.get('id')));
        });
    }

    change($event: any, table: Table) {
        console.log('change', $event, table);
        table.rating = $event.rating;
    }

    submit(table: Table) {
        this.api.updateTable(table.id, {
            type: table.type ?? '',
            rom: table.rom ?? '',
            rating: table.rating,
            vpsid: table.vpsid ?? '',
            b2s: table.b2s ?? '',
            haspup: table.haspup,
        }).subscribe(result => {
            let message = `Unable to update table: ${result}`;
            if (result === true) {
                this.table$ = this.api.getTable(table.id);
                message = 'Table successfully updated!';
            }

            this.snackBar.open(message, 'Close', { duration: 3000 });
        });
    }

    lookup(vpsid: string | undefined) {
        if (!vpsid) {
            return;
        }

        const dialogRef = this.dialog.open(VpsResultComponent, {
            width: '500px',
            height: '500px',
            data: {},
        });
    }
}
