import { ConfigurationService } from './configuration.service';
import { TestBed } from '@angular/core/testing';

describe('ConfigurationService', () => {
    let service: ConfigurationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ConfigurationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
