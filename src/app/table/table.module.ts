import { CommonModule, JsonPipe } from '@angular/common';

import { DetailComponent } from './detail/detail.component';
import { FormsModule } from '@angular/forms';
import { ListComponent } from './list/list.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgModule } from '@angular/core';
import { StarRatingModule } from 'angular-star-rating';
import { TableFilterPipe } from './pipes/table-filter.pipe';
import { TableRoutingModule } from 'src/app/table/table-routing.module';
import { VpsResultComponent } from './vps-result/vps-result.component';

@NgModule({
    declarations: [
        ListComponent,
        DetailComponent,
        TableFilterPipe,
        VpsResultComponent
    ],
    imports: [
        CommonModule,
        TableRoutingModule,
        FormsModule,
        MatFormFieldModule,
        MatListModule,
        MatInputModule,
        MatCheckboxModule,
        MatButtonModule,
        MatCardModule,
        MatSnackBarModule,
        MatIconModule,
        JsonPipe,
        StarRatingModule.forRoot(),
        MatDialogModule,
    ],
})
export class TableModule {}
