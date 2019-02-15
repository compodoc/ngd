export declare class Logger {
    name: any;
    logger: any;
    version: any;
    silent: any;
    constructor();
    setVerbose(level: boolean): void;
    title(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    fatal(...args: any[]): void;
    debug(...args: any[]): void;
    trace(error: any, file: any): void;
    private format;
}
export declare let logger: Logger;
