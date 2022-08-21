import { CommonModule } from '@angular/common';
import { ExportComponent } from './export.component';
import { ExportRoutingModule } from 'src/app/export/export-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [ExportComponent],
    imports: [
        CommonModule,
        ExportRoutingModule,
        MatButtonModule
    ],
})
export class ExportModule {}
