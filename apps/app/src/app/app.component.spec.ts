import { TestBed } from '@angular/core/testing';
import { createSpyObj } from 'jest-createspyobj';
import { NgxPusherService } from 'ngx-pusher';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let pusherService: jest.Mocked<NgxPusherService>;
  let messages$: Subject<string>;
  beforeEach(async () => {
    pusherService = createSpyObj(NgxPusherService);
    messages$ = new Subject<string>();
    pusherService.listen.mockReturnValue(messages$);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [{ provide: NgxPusherService, useValue: pusherService }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
