import { CommonModule } from '@angular/common';
import { ImportComponent } from 'src/app/import/import.component';
import { ImportRoutingModule } from 'src/app/import/import-routing.module';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [ImportComponent],
    imports: [CommonModule, ImportRoutingModule],
})
export class ImportModule {}
