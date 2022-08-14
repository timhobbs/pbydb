import { CommonModule } from '@angular/common';
import { GameRoutingModule } from 'src/app/game/game-routing.module';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [ListComponent],
    imports: [
        CommonModule,
        GameRoutingModule,
    ],
})
export class GameModule {}
