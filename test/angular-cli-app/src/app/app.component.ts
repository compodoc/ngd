import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    'AppComponentProvider1',
    'AppComponentProvider2'
  ]
})
export class AppComponent {
  title = 'app works!';
}
