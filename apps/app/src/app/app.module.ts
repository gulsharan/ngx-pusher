import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxPusherModule } from 'ngx-pusher';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { PusherAuthorizer } from './pusher.authorizer';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,

    // Register ngx-pusher
    NgxPusherModule.forRoot({
      appKey: environment.pusherAppKey,
      pusherOptions: {
        cluster: environment.pusherCluster,
      },
      // [OPTIONAL AUTHORIZER]
      authorizer: {
        deps: [HttpClient],
        useFactory: (http: HttpClient) => new PusherAuthorizer(http),
        // useClass: PusherAuthorizer,
        // useExisting: PusherAuthorizer
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
