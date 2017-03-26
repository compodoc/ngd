export interface Options {
    name?: string;
    output?: string;
    outputFormats?: string;
}
export interface Transformer {
    type: string;
    transform(deps: any, options: Options): Promise<string>;
}
export declare class Engine {
    cwd: string;
    files: {
        component: any;
    };
    transformers: Transformer[];
    options: Options;
    constructor(options: Options);
    registerTransformers(transformer: Transformer | Transformer[]): void;
    transform(deps: any): Promise<string[]>;
}
export declare class DefaultEngine extends Engine {
    constructor(options: Options);
    transform(deps: any): Promise<string[]>;
}
