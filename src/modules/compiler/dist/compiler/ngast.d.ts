import { Compiler, Dependencies } from './compiler';
export declare class NgAst extends Compiler {
    private files;
    private program;
    constructor(files: string[], options: any);
    getDependencies(): Dependencies[];
    private normalizeOptions(options, configFilePath);
    private createProgramFromTsConfig(configFile, overrideFiles?);
    private resourceResolver;
}
