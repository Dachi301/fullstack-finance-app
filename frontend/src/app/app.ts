import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxLoadingBar } from '@ngx-loading-bar/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxLoadingBar],
  template: `
    <ngx-loading-bar
      color="#357C50"
      height="3px"
      [includeSpinner]="false"
    />

    <router-outlet />
  `,
})
export class App {
  
}
