/// <reference path="../typings/_custom.d.ts" />

import { Provider, Injectable } from 'angular2/angular2';
import { QUESTIONS } from '../data/questions';
import { Store } from './Store';

export enum QUESTION {
  NEXT, PREVIOUS
}

export interface IChoice {
	id: string;
	label: string;
	correct: boolean;
	checked?: boolean;
	toggle(): void;
	isCorrect(): boolean;
}

export interface IQuestion {
	id: string;
	title: string;
	description: string;
	choices: IChoice[];
	toggle(choice: IChoice): void;
	isCorrect(): boolean;
}

export interface IQuestionsStore {
	fetch(filterId?: string): Promise<IQuestion[]>;
	computeResult(questions?): number;
}

class Choice implements IChoice {
	id: string;
	label: string;
	correct: boolean;
	checked: boolean;
	constructor(choice?: IChoice) {
		if(choice) {
			this.id = choice.id;
			this.label = choice.label;
			this.correct = choice.correct;
			this.checked = choice.checked || false;
		}
	}
	toggle() {
		this.checked = ! this.checked;
	}
	isCorrect() {
		return (this.correct && this.checked) || (!this.correct && !this.checked);
	}
}

export class Question implements IQuestion {
	id = '';
	title = '';
	description = '';
	choices: IChoice[] = [];	
	constructor(question?: IQuestion) {
		if(question) {
			this.id = question.id;
			this.title = question.title;
			this.description = question.description;
			this.choices = question.choices.map( (choice: IChoice) => new Choice(choice) );
		}
	}
	
	toggle(choice: IChoice): void {
		let index = this.find(choice);
		if( index !== undefined ){
			this.choices[index].toggle();
		}
	}
	isCorrect() {
		return this.choices.filter( (choice: IChoice) => choice.isCorrect() ).length === this.choices.length;
	}
	
	private find(choice: IChoice) {
		return this.choices.findIndex( (_choice: IChoice) => _choice.id === choice.id);
	}
}

@Injectable()
export class QuestionsStore {
	
	private questions: IQuestion[];

	constructor(questions: IQuestion[] = QUESTIONS){
		this.questions = questions.map( (question: IQuestion) => new Question(question));	
	}
	
	public save(questions: IQuestion[]) {
		Store.save(questions);
	}
	
	public fetch(filterId?: string): Promise<IQuestion[]> {
		let data = this.questions;
		
		if(filterId) {
			data = data.filter( (question: IQuestion) => question.id === filterId);
		}
		
		if(data) {
			return Promise.resolve(data);
		}
		else {
			return <any>(Promise.reject([]));
		}
	}

	public computeResult(questions?): number {
		return (this.questions || questions)
			.filter( (question: IQuestion ) => question.isCorrect() ).length;
	}
}
