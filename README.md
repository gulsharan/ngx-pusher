# Ngx-Pusher

A library for adding [PusherJs](https://www.npmjs.com/package/pusher-js) to your Angular 13+ app.
 It allows you to seamlessly subscribe to Pusher channels and operate on Observable streams of events.

## Steps

### 1. Install the library
```
npm install --save ngx-pusher
```

### 2. Create custom authorizer [OPTIONAL]
Your authorizer class must implement the [NgxPusherAuthorizer](/libs/ngx-pusher/src/lib/interface.ts) interface.
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

### 3. Add <kbd>NgxPusherModule</kbd> to your root module
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

### 4. Default Channel [OPTIONAL]
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

### 5. Subscribe to incoming events

```typescript
@Injectable()
export class MyMessageHandlerService {
  constructor(pusherService: NgxPuserServicee) {
    // Default channel
    pusherService
      .listen<ChatMessage>('message-received')
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

# PusherJs instance
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
