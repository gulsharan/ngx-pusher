<div style="text-align:center">

  <h3>
    ngx-pusher
  </h3>

  <p>
    Lightweight Angular library for integrating Pusher into Angular applications.
  </p>

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/gulsharan/ngx-pusher)](https://github.com/gulsharan/ngx-pusher/releases)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/ngx-pusher)](https://bundlephobia.com/package/ngx-pusher)
[![NPM](https://img.shields.io/npm/l/ngx-pusher)](https://github.com/gulsharan/ngx-pusher/blob/main/LICENSE)
[![CircleCI](https://img.shields.io/circleci/build/gh/gulsharan/ngx-pusher?token=b9fff275a3dc37e1c72bba5dc27bb3d99075488e)](https://app.circleci.com/pipelines/github/gulsharan/ngx-pusher)
[![GitHub issues](https://img.shields.io/github/issues/gulsharan/ngx-pusher)](https://github.com/gulsharan/ngx-pusher/issues)

</div>

## Table Of Contents

- [About](#about)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Subscribe to multiple events](#subscribe-to-multiple-events)
- [Contributing](#contributing)
- [License](#license)

## About

A lightweight Angular library for adding PusherJs API to your Angular 13+ app.
It allows you to seamlessly subscribe to Pusher channels and operate on Observable event streams.


## Installation
```
npm install --save ngx-pusher
```
If you are using yarn
```
yarn add ngx-pusher
```

## Getting Started

1. Create custom authorizer [OPTIONAL]
   Your authorizer class must implement the [NgxPusherAuthorizer](https://github.com/gulsharan/ngx-pusher/blob/ba56dd98b50d4ca57a706df995a0b0c4a7e9a2a9/libs/ngx-pusher/src/lib/interface.ts#L10) interface.
    ```typescript
    export class CustomPusherAuthorizer implements NgxPusherAuthorizer {
      constructor(private http: HttpClient) {}
    
      authorize(channelName: string, socketId: string): Observable<NgxPusherAuth> {
        return this.http.post<NgxPusherAuth>('/auth/pusher', {
          socketId,
          channelName,
        });
      }
    }
    ```

2. Add <kbd>NgxPusherModule</kbd> to your root module
    ```typescript
    @NgModule({
      declarations: [AppComponent],
      imports: [
        BrowserModule,
        HttpClientModule,
    
        /* import ngx-pusher */
        
        NgxPusherModule.forRoot({
          appKey: environment.pusherAppKey,
          pusherOptions: {
            cluster: environment.pusherCluster,
          },
          
          /* register custom authorizer (optional) */
          
          authorizer: {
            deps: [HttpClient],
            useFactory: (http: HttpClient) => new CustomPusherAuthorizer(http),
            // useClass: CustomPusherAuthorizer,
            // useExisting: CustomPusherAuthorizer
          },
        }),
        
      ],
      bootstrap: [AppComponent],
    })
    export class AppModule {}
    ```

3. Default Channel [OPTIONAL]
   You can set up a default (private/presence) channel for the logged-in user.
    ```typescript
    @Injectable()
    export class AuthService {
      constructor(private pusherService: NgxPuserServicee) {}
    
      userLoggedIn(user: IUser) {
        this.pusherService.subscribe(`private-${user.username}`);
      }
    }
    
    ```

4. Subscribe to incoming events

    ```typescript
    @Injectable()
    export class MyMessageHandlerService {
      constructor(pusherService: NgxPuserServicee) {
        // Default channel
        pusherService
          .listen<ChatMessage>('ev:message')
          .subscribe((msg: ChatMessage) => {
            console.log('Message Received', msg.content);
          });
        
        // Custom channel
        pusherService
          .listen<any>('file-processed', 'custom-channel')
          .subscribe((msg: any) => console.log(msg));
      }
    }
    
    export interface ChatMessage {
      sender: string;
      content: string;
    }
    
    ```

### PusherJs instance
You can use the `pusherInstance()` method to get the underlying pusher instance:

```typescript
import { NgxPusherService } from "./ngx-pusher.service";

@Injectable()
export class MyMessageHandlerService {
  constructor(pusherService: NgxPusherServicer) {
    // Get pusher instance
    const pusher = pusherService.pusherInstance();
  }
}
```
### Subscribe to multiple events
You can subscribe to more than one event on the same channel by passing in an array of event names.
```typescript
pusherService
  .listen<ChatMessage>(['ev:message', 'ev:meeting-request'])
  .subscribe((msg: ChatMessage) => {
    console.log('Message Received', msg.content);
});
```

## Contributing
Any contributions to make this project better are much appreciated. Please follow the following guidelines
before getting your hands dirty.

- Fork the repository
- Run `yarn`
- Make your changes, and don't forget to add unit tests.
- Run lint
  ```
  npm run lint
  ```
- Run test
  ```
  npm run test
  ```
- Commit/Push any changes to your repository
- Open a pull request

## License
Distributed under the MIT License. See [LICENSE](https://github.com/gulsharan/ngx-pusher/blob/main/LICENSE) for more information.

## Acknowledgements
- [PusherJs](https://www.npmjs.com/package/pusher-js)
- [Nx](https://www.npmjs.com/package/nx)
