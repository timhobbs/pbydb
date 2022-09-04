import { APP_INITIALIZER, NgModule } from '@angular/core';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { ConfigurationService } from 'src/app/services/configuration/configuration.service';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const config: SocketIoConfig = { url: 'http://localhost:3030', options: {} };

@NgModule({
    declarations: [AppComponent, PageNotFoundComponent, HomeComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatToolbarModule,
        MatButtonModule,
        SocketIoModule.forRoot(config),
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: (config: ConfigurationService) => () =>
                config.load().then(() => Promise.resolve()).catch((err: any) => err),
            deps: [ConfigurationService],
            multi: true,
        }
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
