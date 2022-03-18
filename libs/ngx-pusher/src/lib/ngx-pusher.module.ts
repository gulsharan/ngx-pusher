import {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import { Provider } from '@angular/core';

import { NgxPusherAuthorizerOptions, NgxPusherOptions } from './interface.d';
import {
  NGX_PUSHER_KEY,
  NGX_PUSHER_OPTIONS,
  NGX_PUSHER_AUTHORIZER,
  NgxPusherFactoryService,
} from './ngx-pusher-factory.service';
import { NgxPusherService } from './ngx-pusher.service';

@NgModule()
export class NgxPusherModule {
  static forRoot(
    options: NgxPusherOptions,
  ): ModuleWithProviders<NgxPusherModule> {
    return {
      ngModule: NgxPusherModule,
      providers: [
        {
          provide: NGX_PUSHER_KEY,
          useValue: options.appKey,
        },
        {
          provide: NGX_PUSHER_OPTIONS,
          useValue: options.pusherOptions,
        },
        ...this.createAuthorizerProvider(options.authorizer),
        NgxPusherService,
        NgxPusherFactoryService,
      ],
    };
  }

  private static createAuthorizerProvider(
    authorizer?: NgxPusherAuthorizerOptions,
  ): Provider[] {
    if (!authorizer) return [];
    if (authorizer.useExisting) {
      return [
        {
          provide: NGX_PUSHER_AUTHORIZER,
          useExisting: authorizer.useExisting,
        } as ExistingProvider,
      ];
    }

    if (authorizer.useClass) {
      return [
        {
          provide: NGX_PUSHER_AUTHORIZER,
          useClass: authorizer.useClass,
        } as ClassProvider,
      ];
    }

    if (authorizer.useFactory) {
      return [
        {
          provide: NGX_PUSHER_AUTHORIZER,
          useFactory: authorizer.useFactory,
          deps: authorizer.deps || [],
        } as FactoryProvider,
      ];
    }

    return [];
  }
}
