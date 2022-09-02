import { CommonModule } from '@angular/common';
import { ImportComponent } from 'src/app/import/import.component';
import { ImportRoutingModule } from 'src/app/import/import-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [ImportComponent],
    imports: [
        CommonModule,
        ImportRoutingModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
    ],
})
export class ImportModule {}
