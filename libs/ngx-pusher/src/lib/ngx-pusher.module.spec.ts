/* eslint-disable */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MockBuilder, MockProvider, MockRender } from 'ng-mocks';
import { PusherMock } from 'pusher-js-mock';
import { Observable, of } from 'rxjs';

import { NgxPusherAuth, NgxPusherAuthorizer } from './interface.d';
import {
  NGX_PUSHER_AUTHORIZER,
  NGX_PUSHER_KEY,
  NGX_PUSHER_OPTIONS,
  NgxPusherFactoryService,
} from './ngx-pusher-factory.service';
import { NgxPusherModule } from './ngx-pusher.module';
import { NgxPusherService } from './ngx-pusher.service';

jest.mock('pusher-js', () => ({
  default: PusherMock,
}));

@Injectable()
export class DummyAuthorizer implements NgxPusherAuthorizer {
  authorize(channelName: string, socketId: string): Observable<NgxPusherAuth> {
    return of({ auth: `abcdefg-${channelName}-${socketId}` });
  }
}

@Injectable()
class DummyAuthorizerWithDeps implements NgxPusherAuthorizer {
  constructor(private http: HttpClient) {}
  authorize(channelName: string, socketId: string): Observable<NgxPusherAuth> {
    return this.http.post<NgxPusherAuth>('/auth/pusher', {
      channelName,
      socketId,
    });
  }
}

describe('NgxPusherModule', () => {
  // ┌┐┌┌─┐  ┌─┐┬ ┬┌┬┐┬ ┬┌─┐┬─┐┬┌─┐┌─┐┬─┐
  // ││││ │  ├─┤│ │ │ ├─┤│ │├┬┘│┌─┘├┤ ├┬┘
  // ┘└┘└─┘  ┴ ┴└─┘ ┴ ┴ ┴└─┘┴└─┴└─┘└─┘┴└─
  describe('No authorizer provider', () => {
    beforeEach(() =>
      MockBuilder(
        NgxPusherModule.forRoot({
          appKey: 'my-api-key',
          pusherOptions: { cluster: 'us2' },
        }),
      )
        // .provide(MockProvider(NgxPusherFactoryService))
        .keep(NGX_PUSHER_KEY)
        .keep(NGX_PUSHER_OPTIONS)
        .keep(NGX_PUSHER_AUTHORIZER),
    );

    it('creates NGX_PUSHER_KEY', () => {
      const token = MockRender(NGX_PUSHER_KEY).point.componentInstance;
      expect(token).toEqual('my-api-key');
    });

    it('creates NGX_PUSHER_OPTIONS', () => {
      const token = MockRender(NGX_PUSHER_OPTIONS).point.componentInstance;
      expect(token).toEqual({ cluster: 'us2' });
    });

    it('creates NGX_PUSHER_AUTHORIZER', (done) => {
      try {
        MockRender(NGX_PUSHER_AUTHORIZER);
        done('Must throw null injection error');
      } catch (e: any) {
        expect(e.message).toContain(
          'No provider for InjectionToken NGX_PUSHER_AUTHORIZER',
        );
        done();
      }
    });

    it('creates NgxPusherService', () => {
      const token = MockRender(NgxPusherService).point.componentInstance;
      expect(token).toBeInstanceOf(NgxPusherService);
      expect(token.pusherInstance()).toBeInstanceOf(PusherMock);
    });

    it('creates NgxPusherFactoryService', () => {
      const token = MockRender(NgxPusherFactoryService).point.componentInstance;
      expect(token).toBeInstanceOf(NgxPusherFactoryService);

      const pusher = token.createPusher();
      expect(pusher).toBeInstanceOf(PusherMock);
      expect((<any>pusher).clientKey).toBe('my-api-key');
      expect((<any>pusher).config.cluster).toBe('us2');
    });
  });

  // ┬ ┬┌─┐┌─┐  ┌─┐─┐ ┬┬┌─┐┌┬┐┬┌┐┌┌─┐
  // │ │└─┐├┤   ├┤ ┌┴┬┘│└─┐ │ │││││ ┬
  // └─┘└─┘└─┘  └─┘┴ └─┴└─┘ ┴ ┴┘└┘└─┘
  describe('Authorizer defined with useExisting', () => {
    beforeEach(() =>
      MockBuilder(
        NgxPusherModule.forRoot({
          appKey: 'my-api-key',
          pusherOptions: { cluster: 'us2' },
          authorizer: {
            useExisting: DummyAuthorizer,
          },
        }),
      )
        .provide(DummyAuthorizer)
        .keep(NGX_PUSHER_AUTHORIZER),
    );

    it('creates NGX_PUSHER_AUTHORIZER', () => {
      const token = MockRender(NGX_PUSHER_AUTHORIZER).point.componentInstance;
      expect(token).toBeInstanceOf(DummyAuthorizer);
    });
  });

  // ┬ ┬┌─┐┌─┐  ┌─┐┬  ┌─┐┌─┐┌─┐
  // │ │└─┐├┤   │  │  ├─┤└─┐└─┐
  // └─┘└─┘└─┘  └─┘┴─┘┴ ┴└─┘└─┘
  describe('Authorizer defined with useClass', () => {
    beforeEach(() =>
      MockBuilder(
        NgxPusherModule.forRoot({
          appKey: 'my-api-key',
          pusherOptions: { cluster: 'us2' },
          authorizer: {
            useClass: DummyAuthorizer,
          },
        }),
      ).keep(NGX_PUSHER_AUTHORIZER),
    );

    it('creates NGX_PUSHER_AUTHORIZER', () => {
      const token = MockRender(NGX_PUSHER_AUTHORIZER).point.componentInstance;
      expect(token).toBeInstanceOf(DummyAuthorizer);
    });
  });

  // ┬ ┬┌─┐┌─┐  ┌─┐┌─┐┌─┐┌┬┐┌─┐┬─┐┬ ┬
  // │ │└─┐├┤   ├┤ ├─┤│   │ │ │├┬┘└┬┘
  // └─┘└─┘└─┘  └  ┴ ┴└─┘ ┴ └─┘┴└─ ┴
  describe('Authorizer defined with useFactory', () => {
    beforeEach(() =>
      MockBuilder(
        NgxPusherModule.forRoot({
          appKey: 'my-api-key',
          pusherOptions: { cluster: 'us2' },
          authorizer: {
            deps: [HttpClient],
            useFactory: (http: HttpClient) => new DummyAuthorizerWithDeps(http),
          },
        }),
      )
        .provide(MockProvider(HttpClient))
        .keep(NGX_PUSHER_AUTHORIZER),
    );

    it('creates NGX_PUSHER_AUTHORIZER', () => {
      const token = MockRender(NGX_PUSHER_AUTHORIZER).point.componentInstance;
      expect(token).toBeInstanceOf(DummyAuthorizerWithDeps);
    });
  });
});
