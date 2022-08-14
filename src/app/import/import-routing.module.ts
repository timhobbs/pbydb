import { RouterModule, Routes } from '@angular/router';

import { ImportComponent } from 'src/app/import/import.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
    { path: '', component: ImportComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ImportRoutingModule {}
