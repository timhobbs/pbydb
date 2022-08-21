import { Component, OnInit } from '@angular/core';

import { ApiService } from 'src/app/services/api.service';
import { ConfigurationData } from 'src/app/configuration/configuration.interface';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-configuration',
    templateUrl: './configuration.component.html',
    styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements OnInit {
    config$: Observable<ConfigurationData[]> | undefined;

    constructor(
        private api: ApiService,
    ) {}

    ngOnInit(): void {
        this.config$ = this.api.getConfig();
    }

    submit(cfg: ConfigurationData) {

    }
}
