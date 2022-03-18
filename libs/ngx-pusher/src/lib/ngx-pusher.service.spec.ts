/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { createSpyObj } from 'jest-createspyobj';
import PusherJs, { Channel } from 'pusher-js';

import { NgxPusherFactoryService } from './ngx-pusher-factory.service';
import { NgxPusherService } from './ngx-pusher.service';

describe('NgxPusherService', () => {
  const greetingEvent = 'ev:greeting';
  const defaultChannel = 'default-channel';
  const givenChannel = 'given-channel';

  let service: NgxPusherService;
  let pusherFactory: jest.Mocked<NgxPusherFactoryService>;
  let pusher: jest.Mocked<PusherJs>;
  let channel: jest.Mocked<Channel>;

  beforeEach(() => {
    pusherFactory = createSpyObj(NgxPusherFactoryService);
    pusher = createSpyObj(PusherJs, ['subscribe', 'channel']);
    channel = createSpyObj(Channel, ['bind']);

    pusherFactory.createPusher.mockReturnValue(pusher);

    TestBed.configureTestingModule({
      providers: [
        NgxPusherService,
        { provide: NgxPusherFactoryService, useValue: pusherFactory },
      ],
    });
    service = TestBed.inject(NgxPusherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should use factory to create a pusher instance', () => {
    expect(service.pusherInstance()).toBe(pusher);
    expect(pusherFactory.createPusher).toHaveBeenCalled();
  });

  describe('defaultChannel()', () => {
    it('should return the default channel', () => {
      pusher.subscribe.mockReturnValue(channel);
      service.setupDefaultChannel('hello-channel');
      expect(service.defaultChannel()).toBe(channel);
    });
    it('should throw an error if not set', (done) => {
      try {
        service.defaultChannel();
        done('Error must be thrown');
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('Default channel has not been set.');
        done();
      }
    });
  });

  describe('listen<T>()', () => {
    beforeEach(() => {
      channel.bind.mockImplementation(
        (eventName: string, callback: any, context?: any) => {
          expect(eventName).toBe(greetingEvent);
          expect(context).toBeUndefined();
          callback('Hello, World');
          return channel;
        },
      );
      pusher.subscribe.mockReturnValue(channel);
    });

    it('should bind to the given channel', (done) => {
      service
        .listen<string>(greetingEvent, givenChannel)
        .subscribe((message) => {
          expect(message).toBe('Hello, World');
          done();
        });
      expect(pusher.subscribe).toHaveBeenCalledWith(givenChannel);
    });

    it('should bind to the default channel if a channel not explicitly specified', (done) => {
      service.setupDefaultChannel(defaultChannel);
      service.listen<string>(greetingEvent).subscribe((message) => {
        expect(message).toBe('Hello, World');
        done();
      });
      expect(pusher.subscribe).toHaveBeenCalledWith(defaultChannel);
    });

    it('should bind to the given channel even if default channel is set', (done) => {
      service.setupDefaultChannel(defaultChannel);
      service
        .listen<string>(greetingEvent, givenChannel)
        .subscribe((message) => {
          expect(message).toBe('Hello, World');
          done();
        });
      expect(pusher.subscribe).toHaveBeenCalledWith(givenChannel);
    });

    it('should throw an error if channel name is missing', () => {
      try {
        service.listen<string>(greetingEvent);
        fail('Error must be thrown');
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('No channel specified.');
        expect(pusher.subscribe).not.toHaveBeenCalled();
      }
    });
  });

  describe('on<T>()', () => {
    beforeEach(() => {
      channel.bind.mockImplementation(
        (eventName: string, callback: any, context?: any) => {
          expect(eventName).toBe(greetingEvent);
          expect(context).toBeUndefined();
          callback('Hello, World');
          return channel;
        },
      );
      pusher.subscribe.mockReturnValue(channel);
    });

    it('should bind to the given channel', (done) => {
      service
        .on<string>(greetingEvent, 'given-channel')
        .subscribe((message) => {
          expect(message).toBe('Hello, World');
          done();
        });
      expect(pusher.subscribe).toHaveBeenCalledWith('given-channel');
    });

    it('should bind to the default channel if a channel not explicitly specified', (done) => {
      service.setupDefaultChannel('default-channel');
      service.on<string>(greetingEvent).subscribe((message) => {
        expect(message).toBe('Hello, World');
        done();
      });
      expect(pusher.subscribe).toHaveBeenCalledWith('default-channel');
    });

    it('should bind to the given channel even if default channel is set', (done) => {
      service.setupDefaultChannel('default-channel');
      service
        .on<string>(greetingEvent, 'given-channel')
        .subscribe((message) => {
          expect(message).toBe('Hello, World');
          done();
        });
      expect(pusher.subscribe).toHaveBeenCalledWith('given-channel');
    });

    it('should throw an error if channel name is missing', () => {
      try {
        service.on<string>(greetingEvent);
        fail('Error must be thrown');
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('No channel specified.');
        expect(pusher.subscribe).not.toHaveBeenCalled();
      }
    });
  });
});
