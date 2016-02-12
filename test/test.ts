import {Component} from 'angular2/core';

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

class Foo {}
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
