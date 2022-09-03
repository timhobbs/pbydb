import { CommonModule } from '@angular/common';
import { ImportComponent } from 'src/app/import/import.component';
import { ImportRoutingModule } from 'src/app/import/import-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgModule } from '@angular/core';
import { ProcessPercentagePipe } from './pipes/process-percentage/process-percentage.pipe';
import { ProcessStatusPipe } from './pipes/process-status/process-status.pipe';
@NgModule({
    declarations: [ImportComponent, ProcessStatusPipe, ProcessPercentagePipe],
    imports: [
        CommonModule,
        ImportRoutingModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
    ],
})
export class ImportModule {}
