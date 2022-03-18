import { Component } from '@angular/core';
import { NgxPusherService } from 'ngx-pusher';

@Component({
  selector: 'gg-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'app';
  constructor(pusherService: NgxPusherService) {
    pusherService.listen('hello', 'private-my-channel').subscribe(console.log);
  }
}
