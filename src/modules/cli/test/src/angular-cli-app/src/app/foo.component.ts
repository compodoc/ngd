import { Component } from '@angular/core';

@Component({
  selector: 'app-foo',
  template: `
    <app-baz [fazz]="true">
      <app-baz [fazz]="true">
        <app-baz [fazz]="true">
          <app-baz [fazz]="true"></app-baz>
        </app-baz>
      </app-baz>
    </app-baz>
  `,
  styleUrls: ['./app.component.css']
})
export class FooComponent {
}
