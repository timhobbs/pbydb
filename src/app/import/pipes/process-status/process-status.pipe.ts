import { Pipe, PipeTransform } from '@angular/core';

import { DbService } from 'src/app/services/db/db.service';

@Pipe({
    name: 'processStatus',
})
export class ProcessStatusPipe implements PipeTransform {
    previousStatus = '';

    constructor(
        private db: DbService,
    ) {}

    transform(status: any): string {
        console.log('***** status', status);
        if (status.success) {
            this.db.addResolved(status.msg);
        } else {
            this.db.addRejected(status.msg);
        }

        this.previousStatus += (status.success ? 'RESOLVED' : 'REJECTED') + ': ' + status.msg.join(',') + '\n';

        return this.previousStatus;
    }
}
