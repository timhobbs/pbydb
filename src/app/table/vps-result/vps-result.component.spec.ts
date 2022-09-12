import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VpsResultComponent } from './vps-result.component';

describe('VpsResultComponent', () => {
    let component: VpsResultComponent;
    let fixture: ComponentFixture<VpsResultComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VpsResultComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VpsResultComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
