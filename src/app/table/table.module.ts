import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NgModule } from '@angular/core';
import { TableRoutingModule } from 'src/app/table/table-routing.module';

@NgModule({
    declarations: [ListComponent],
    imports: [
        CommonModule,
        TableRoutingModule,
        MatSidenavModule,
        MatListModule,
    ],
})
export class TableModule {}
