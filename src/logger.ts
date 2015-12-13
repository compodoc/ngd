/// <reference path="../typings/node/node.d.ts" />
let c = require('colors');

enum LEVEL {
	INFO,
	WARN,
	FATAL, ERROR
}

class Logger {
	
	name;
	
	constructor() {
		this.name = require('../package.json').shortName;
	}
	
	info(...args) {
		console.log(
			this.format(LEVEL.INFO, args)
		);
	}
	
	warn(...args) {
		console.warn(
			this.format(LEVEL.WARN, args)	
		);
	}
	
	error(...args) {
		console.error(
			this.format(LEVEL.FATAL, args)
		);
	}
	
	fatal(...args) {
		this.error(...args);
	}
	
	private format(level, ...args) {
		
		switch(level) {
			case LEVEL.INFO: 
				args = c.green(args.join('')); 
				break;
				
			case LEVEL.WARN: 
				args = c.yellow(args.join('')); 
				break;
				
			case LEVEL.ERROR:
			case LEVEL.FATAL: 
				args = c.red(args.join('')); 
				break;
		}
		
		return [
			c.yellow.bgMagenta(`[${this.name}]`),
			c.yellow.bgBlue(`[${new Date().toISOString()}]`),
			args
		].join(' ')
	}
}

export let logger = new Logger();