import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import PusherJs, { AuthorizerCallback, Options } from 'pusher-js';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NgxPusherAuthorizer } from './interface.d';

export const NGX_PUSHER_KEY = new InjectionToken<string>('NGX_PUSHER_KEY');
export const NGX_PUSHER_OPTIONS = new InjectionToken<Options>(
  'NGX_PUSHER_OPTIONS',
);
export const NGX_PUSHER_AUTHORIZER = new InjectionToken<NgxPusherAuthorizer>(
  'NGX_PUSHER_AUTHORIZER',
);

@Injectable()
export class NgxPusherFactoryService {
  constructor(
    @Inject(NGX_PUSHER_KEY) private appKey: string,
    @Inject(NGX_PUSHER_OPTIONS) private options: Options,
    @Optional()
    @Inject(NGX_PUSHER_AUTHORIZER)
    private authorizer?: NgxPusherAuthorizer,
  ) {}

  createPusher() {
    return new PusherJs(this.appKey, {
      ...this.options,
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          this._authorize(channel.name, socketId, callback);
        },
      }),
    });
  }

  private _authorize(
    channelName: string,
    socketId: string,
    callback: AuthorizerCallback,
  ) {
    if (!this.authorizer) throw new Error('Authorizer not specified');
    return this.authorizer
      .authorize(channelName, socketId)
      .pipe(
        catchError((e) => {
          callback(e, { auth: '' });
          return EMPTY;
        }),
      )
      .subscribe(({ auth }) => callback(null, { auth }));
  }
}
