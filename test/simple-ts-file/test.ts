import {Component, NgModule, Directive} from '@angular2/core';
import {BrowserModule} from '@angular2/platform-browser';

@Component({
	inputs: ['input1', 'input2'],
	outputs: ['output1', 'output2'],
	selector: 'selector-1',
	styles: [`
		.host {
			width: 100%;
		  height: 4px;
		  top: 0;
		  position: fixed;
		  left: 0px;
		}
	`],
	template: `
	<div class="host" [class.animate]="isNext">
		<div></div>
	</div>
	`
})
export class Test1 {
	constructor() {}
}

@Directive({selector:'app-foo'})
class Foo {}

@Component({selector:'app-bar'})
class Bar {}
class Service {}

@Component({
	inputs: ['input1', 'input2'],
	outputs: ['output1', 'output2'],
	selector: 'selector-2',
	templateUrl: `
	/path/to/html.html
	`,
	directives: [Foo, Bar],
	providers: [Service]

})
export class Test2 {
	constructor() {}
}

@Component({
	selector: 'selector-3',
	inputs: ['input1', 'input2']
})
export class Test3 {
	constructor() {}
}


@NgModule({
  declarations: [Foo, Bar],
  imports: [Browser],
  bootstrap: [Foo]
})
export TestModule {}
