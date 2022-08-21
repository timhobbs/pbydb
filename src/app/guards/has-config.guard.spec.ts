import { HasConfigGuard } from './has-config.guard';
import { TestBed } from '@angular/core/testing';

describe('HasConfigGuard', () => {
    let guard: HasConfigGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        guard = TestBed.inject(HasConfigGuard);
    });

    it('should be created', () => {
        expect(guard).toBeTruthy();
    });
});
