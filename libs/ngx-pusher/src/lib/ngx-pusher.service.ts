/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import PusherJs, { Channel } from 'pusher-js';
import { Observable, ReplaySubject, Subject } from 'rxjs';

import { NgxPusherFactoryService } from './ngx-pusher-factory.service';

@Injectable()
export class NgxPusherService {
  private readonly _pusher: PusherJs;
  private _defaultChannel: Channel | undefined;
  private _streams: { [eventName: string]: Subject<any> } = {};

  constructor(pusherFactory: NgxPusherFactoryService) {
    this._pusher = pusherFactory.createPusher();
  }

  private _on<T>(eventName: string, channel: Channel): Observable<T> {
    if (!this._streams[eventName]) {
      const stream = new ReplaySubject<T>();
      channel.bind(eventName, (data: T) => stream.next(data));
      this._streams[eventName] = stream;
    }
    return this._streams[eventName];
  }

  private _getChannel(channelName: string): Channel {
    return (
      this._pusher.channel(channelName) || this._pusher.subscribe(channelName)
    );
  }

  /**
   * Get the underlying pusher instance
   */
  pusherInstance(): PusherJs {
    return this._pusher;
  }

  /**
   * Get default channel
   * @throws Error if default channel has not been set
   */
  defaultChannel(): Channel {
    if (!this._defaultChannel)
      throw new Error('Default channel has not been set.');
    return this._defaultChannel;
  }

  /**
   * Setup default channel
   * @param channelName
   */
  setupDefaultChannel(channelName: string): void {
    this._defaultChannel = this._pusher.subscribe(channelName);
  }

  /**
   * Get a stream of messages for a specific event. Same as on<T>().
   * @param eventName
   * @param channelName
   */
  listen<T>(eventName: string, channelName?: string): Observable<T> {
    const name = channelName
      ? this._getChannel(channelName)
      : this._defaultChannel;
    if (!name) throw new Error('No channel specified.');
    return this._on<T>(eventName, name);
  }

  /**
   * Get a stream of messages for a specific event. Same as listen<T>().
   * @param eventName
   * @param channelName
   */
  on<T>(eventName: string, channelName?: string): Observable<T> {
    return this.listen(eventName, channelName);
  }
}
