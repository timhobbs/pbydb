import { CommonModule } from '@angular/common';
import { DatabaseComponent } from 'src/app/database/database.component';
import { DatabaseRoutingModule } from 'src/app/database/database-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTreeModule } from '@angular/material/tree';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [DatabaseComponent],
    imports: [
        CommonModule,
        DatabaseRoutingModule,
        MatTreeModule,
        MatButtonModule,
        MatSortModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule,
    ],
})
export class DatabaseModule {}
