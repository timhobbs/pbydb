import { RouterModule, Routes } from '@angular/router';

import { HasConfigGuard } from 'src/app/guards/has-config.guard';
import { HomeComponent } from 'src/app/home/home.component';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from 'src/app/page-not-found/page-not-found.component';

const routes: Routes = [
    { path: 'table', canActivate: [HasConfigGuard], loadChildren: () => import('./table/table.module').then(m => m.TableModule) },
    { path: 'import', canActivate: [HasConfigGuard], loadChildren: () => import('./import/import.module').then(m => m.ImportModule) },
    { path: 'export', canActivate: [HasConfigGuard], loadChildren: () => import('./export/export.module').then(m => m.ExportModule) },
    { path: 'configuration', loadChildren: () => import('./configuration/configuration.module').then(m => m.ConfigurationModule) },
    { path: 'database', loadChildren: () => import('./database/database.module').then(m => m.DatabaseModule) },
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: '**', component: PageNotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
