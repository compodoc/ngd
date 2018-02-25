let c = require('ansi-colors');
let pkg = require('../../package.json');
const fancyLog = require('fancy-log');

enum LEVEL {
	INFO,
	WARN,
	DEBUG,
	FATAL, ERROR
}

export class Logger {

	name;
	logger;
	version;
	silent;

	constructor() {
		this.name = pkg.name;
		this.version = pkg.version;
		this.logger = fancyLog;
		this.silent = false;
  }
  
  setVerbose(level: boolean) {
    this.silent = level;
  }

	title(...args) {
    if(this.silent == false) {
      this.logger(
        c.cyan(...args)
      );
    }
	}

	info(...args) {
    if(this.silent == false) {
      this.logger(
        this.format(LEVEL.INFO, ...args)
      );
    }
	}

	warn(...args) {
    if(this.silent == false) {
      this.logger(
        this.format(LEVEL.WARN, ...args)
      );
    }
	}

	error(...args) {
    if(this.silent == false) {
      this.logger(
        this.format(LEVEL.FATAL, ...args)
      );
    }
	}

	fatal(...args) {
    if(this.silent == false) {
      this.error(...args);
    }
    
  }
	debug(...args) {
    if(this.silent == false) {
      this.logger(
        this.format(LEVEL.DEBUG, ...args)
      );
    }
	}

	trace(error, file) {
		this.fatal('Ouch', file);
		this.fatal('', error);
		this.warn('ignoring', file);
		this.warn('see error', '');
		console.trace(error);
	}

	private format(level, ...args) {

		let pad = (s, l, c='') => {
			return s + Array( Math.max(0, l - s.length + 1)).join( c )
		};

		let msg = args.join(' ');
		if(args.length > 1) {
			msg = `${ pad(args.shift(), 13, ' ') }: ${ args.join(' ') }`;
		}


		switch(level) {
			case LEVEL.INFO:
				msg = c.green(msg);
				break;

			case LEVEL.WARN:
				msg = c.yellow(msg);
				break;

			case LEVEL.DEBUG:
				msg = c.gray(msg);
				break;

			case LEVEL.ERROR:
			case LEVEL.FATAL:
				msg = c.red(msg);
				break;
		}

		return [
			msg
		].join('');
	}
}

export let logger = new Logger();
