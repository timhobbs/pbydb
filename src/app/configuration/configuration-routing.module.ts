import { RouterModule, Routes } from '@angular/router';

import { ConfigurationComponent } from 'src/app/configuration/configuration.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
    { path: '', component: ConfigurationComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ConfigurationRoutingModule { }
