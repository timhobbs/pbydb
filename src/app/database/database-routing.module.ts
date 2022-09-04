import { RouterModule, Routes } from '@angular/router';

import { DatabaseComponent } from 'src/app/database/database.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
    { path: '', component: DatabaseComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DatabaseRoutingModule { }
