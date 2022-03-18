import { HttpClient } from '@angular/common/http';
import { NgxPusherAuth, NgxPusherAuthorizer } from 'ngx-pusher';
import { Observable } from 'rxjs';

export class PusherAuthorizer implements NgxPusherAuthorizer {
  constructor(private http: HttpClient) {}

  authorize(channelName: string, socketId: string): Observable<NgxPusherAuth> {
    return this.http.post<NgxPusherAuth>('/auth/pusher', {
      socketId,
      channelName,
    });
  }
}
