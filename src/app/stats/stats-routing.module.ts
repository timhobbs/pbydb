import { RouterModule, Routes } from '@angular/router';

import { NgModule } from '@angular/core';
import { StatsComponent } from 'src/app/stats/stats.component';

const routes: Routes = [
    { path: '', component: StatsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class StatsRoutingModule { }
