import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from 'src/app/game/list/list.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
    { path: 'list', component: ListComponent },
    { path: '', redirectTo: 'list', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GameRoutingModule {}
