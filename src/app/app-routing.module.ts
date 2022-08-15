import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from 'src/app/home/home.component';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from 'src/app/page-not-found/page-not-found.component';

const routes: Routes = [
    { path: 'table', loadChildren: () => import('./table/table.module').then(m => m.TableModule) },
    { path: 'import', loadChildren: () => import('./import/import.module').then(m => m.ImportModule) },
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: '**', component: PageNotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
