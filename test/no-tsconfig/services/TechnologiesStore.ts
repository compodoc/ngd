/// <reference path="../typings/_custom.d.ts" />

import { THEMES } from '../data/themes';

export interface ITechnology {
	slug: string;
	title: string;
	logo: string;
	description: string;
}

export class TechnologiesStore {
	fetch(): Promise<ITechnology[]> {
		return Promise.resolve(THEMES);
	}
}
