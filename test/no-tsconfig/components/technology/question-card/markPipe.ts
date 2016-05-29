/// <reference path="../../../typings/_custom.d.ts" />

import { Pipe } from 'angular2/angular2';
import { IChoice } from '../../../services/QuestionsStore';

@Pipe({
	name: 'mark'
})
export class  MarkPipe {
	transform(choice: IChoice) {
		return choice.isCorrect() ? '✔' : '✘';
	}
}