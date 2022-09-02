import { TableService } from './table.service';
import { TestBed } from '@angular/core/testing';

describe('TableService', () => {
    let service: TableService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TableService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
