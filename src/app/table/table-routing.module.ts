import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from 'src/app/table/list/list.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
    { path: 'list', component: ListComponent },
    { path: '', redirectTo: 'list', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class TableRoutingModule {}
