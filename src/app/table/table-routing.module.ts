import { RouterModule, Routes, UrlSegment } from '@angular/router';

import { DetailComponent } from 'src/app/table/detail/detail.component';
import { ListComponent } from 'src/app/table/list/list.component';
import { NgModule } from '@angular/core';

const detailMatcher = (url: any) => {
    if (url.length === 1 && url[0].path.match(/^\d*$/)) {
        return {
            consumed: url,
            posParams: {
                id: url[0],
            },
        };
    }

    return null;
};

const routes: Routes = [
    { path: 'list', component: ListComponent },
    { matcher: detailMatcher, component: DetailComponent },
    { path: '', redirectTo: 'list', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [],
})
export class TableRoutingModule {}
