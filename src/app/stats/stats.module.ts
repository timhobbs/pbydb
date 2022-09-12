import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NgModule } from '@angular/core';
import { StatsComponent } from './stats.component';
import { StatsRoutingModule } from 'src/app/stats/stats-routing.module';

@NgModule({
    declarations: [StatsComponent],
    imports: [
        CommonModule,
        StatsRoutingModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatIconModule,
        MatButtonModule,
    ],
})
export class StatsModule {}
