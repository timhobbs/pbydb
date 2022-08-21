import { CanActivate, Router } from '@angular/router';
import { lastValueFrom, retry, take } from 'rxjs';

import { ApiService } from 'src/app/services/api.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class HasConfigGuard implements CanActivate {
    constructor(
        private api: ApiService,
        private router: Router,
    ) {}

    async canActivate(): Promise<boolean> {
        const result = await lastValueFrom(this.api.getConfig().pipe(take(1)));

        if (result.vpxdb) {
            return true;
        }

        this.router.navigateByUrl('/configuration?showmsg=true');
        return false;
    }
}
