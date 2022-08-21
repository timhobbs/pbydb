import { RouterModule, Routes } from '@angular/router';

import { ExportComponent } from 'src/app/export/export.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
    { path: '', component: ExportComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ExportRoutingModule { }
