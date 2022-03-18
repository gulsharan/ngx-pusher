/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { createSpyObj } from 'jest-createspyobj';
import Pusher from 'pusher-js';
import { PusherMock } from 'pusher-js-mock';
import { of, throwError } from 'rxjs';

import {
  NgxPusherFactoryService,
  NGX_PUSHER_KEY,
  NGX_PUSHER_OPTIONS,
  NGX_PUSHER_AUTHORIZER,
} from './ngx-pusher-factory.service';
import { DummyAuthorizer } from './ngx-pusher.module.spec';

jest.mock('pusher-js', () => ({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  default: require('pusher-js-mock').PusherMock,
}));

describe('PusherFactoryService', () => {
  let service: NgxPusherFactoryService;
  let authorizer: jest.Mocked<DummyAuthorizer>;

  beforeEach(() => {
    authorizer = createSpyObj(DummyAuthorizer);
    TestBed.configureTestingModule({
      providers: [
        { provide: NGX_PUSHER_KEY, useValue: 'pusher-app-key-123' },
        { provide: NGX_PUSHER_OPTIONS, useValue: { cluster: 'us2' } },
        { provide: NGX_PUSHER_AUTHORIZER, useValue: authorizer },
        NgxPusherFactoryService,
      ],
    });
    service = TestBed.inject(NgxPusherFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createPusher()', () => {
    let pusher: Pusher;

    beforeEach(() => {
      pusher = service.createPusher();
    });

    it('should create Pusher instance', () => {
      expect(pusher).toBeInstanceOf(PusherMock);
      expect((<any>pusher).clientKey).toBe('pusher-app-key-123');
      expect(pusher.config.cluster).toBe('us2');
      expect(pusher.config.authorizer).toBeDefined();
    });
  });

  describe('custom authorization', () => {
    let pusher: Pusher;

    beforeEach(() => {
      pusher = service.createPusher();
    });

    it('should configure custom authorizer', (done) => {
      if (!pusher.config.authorizer) {
        done('Authorizer must be defined');
        return;
      }

      authorizer.authorize.mockReturnValue(
        of({ auth: 'auth-result-1234-5678' }),
      );

      const channel: any = { name: 'hello-channel' };
      const options: any = {} as any;

      const callback = (error: any, authData: any) => {
        expect(error).toBeNull();
        expect(authData).toEqual({ auth: 'auth-result-1234-5678' });
        expect(authorizer.authorize).toHaveBeenCalledWith(
          'hello-channel',
          'my-socket-id',
        );
        done();
      };

      pusher.config
        .authorizer(channel, options)
        .authorize('my-socket-id', callback);
    });

    it('should handle authorization error', (done) => {
      if (!pusher.config.authorizer) {
        done('Authorizer must be defined');
        return;
      }

      const authorizationError = new Error('Unauthorized user');
      authorizer.authorize.mockReturnValue(throwError(authorizationError));

      const channel: any = { name: 'hello-channel' };
      const options: any = {} as any;

      const callback = (error: any, authData: any) => {
        expect(error).toBe(authorizationError);
        expect(authData).toEqual({ auth: '' });
        expect(authorizer.authorize).toHaveBeenCalledWith(
          'hello-channel',
          'my-socket-id',
        );
        done();
      };

      pusher.config
        .authorizer(channel, options)
        .authorize('my-socket-id', callback);
    });

    it('should trigger authorization when presence channel is subscribed', () => {
      authorizer.authorize.mockReturnValue(
        of({ auth: 'auth-result-1234-5678' }),
      );

      const channel = pusher.subscribe('presence-channel');
      expect(authorizer.authorize).toHaveBeenCalled();
      expect(channel.subscribed).toBe(true);
    });
  });
});
