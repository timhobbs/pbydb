import { DbService } from './db.service';
import { TestBed } from '@angular/core/testing';

describe('DbService', () => {
    let service: DbService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DbService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
