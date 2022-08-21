import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Observable, take } from 'rxjs';

import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ConfigurationData } from 'src/app/configuration/configuration.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-configuration',
    templateUrl: './configuration.component.html',
    styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements OnInit {
    config$: Observable<ConfigurationData> | undefined;
    showmsg = false;

    constructor(
        private api: ApiService,
        private snackBar: MatSnackBar,
        private activatedRoute: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.config$ = this.api.getConfig();
        this.checkForMessage();
    }

    submit(cfg: ConfigurationData) {
        this.api.updateConfig(cfg)
            .pipe(take(1))
            .subscribe(result => {
                let message = `Unable to update configuration: ${result}`;
                if (result === true) {
                    this.config$ = this.api.getConfig();
                    message = 'Configuration successfully updated!';
                }

                this.snackBar.open(message, 'Close', { duration: 3000 });
            });
    }

    private checkForMessage() {
        console.log('***** checking');
        this.activatedRoute.queryParams.subscribe((params)=> {
            console.log('***** params', params['showmsg']);
            this.showmsg = params['showmsg'] ?? false;
        });
    }
}
