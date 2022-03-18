/* eslint-disable @typescript-eslint/no-explicit-any */
import { Type } from '@angular/core';
import { Options } from 'pusher-js';
import { Observable } from 'rxjs';

export interface NgxPusherAuth {
  auth: string;
}

export interface NgxPusherAuthorizer {
  authorize(channelName: string, socketId: string): Observable<NgxPusherAuth>;
}

export interface NgxPusherAuthorizerOptions {
  useExisting?: Type<NgxPusherAuthorizer>;
  useClass?: Type<NgxPusherAuthorizer>;
  useFactory?: (
    ...args: any[]
  ) => Promise<NgxPusherAuthorizer> | NgxPusherAuthorizer;
  deps?: any[];
}

export interface NgxPusherOptions {
  appKey: string;
  pusherOptions: Options;
  authorizer?: NgxPusherAuthorizerOptions;
}
