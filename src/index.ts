/// <reference path="../typings/node/node.d.ts" />
import * as path from 'path';
import {App} from './application';

App.run(
	require('../tsconfig.json')
);