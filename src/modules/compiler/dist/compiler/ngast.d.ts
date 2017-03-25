import { Compiler, Dependencies } from './compiler';
export declare class NgAst extends Compiler {
    private files;
    private program;
    constructor(files: string[], options: any);
    getDependencies(): Dependencies[];
    private getFileName(contextSymbols);
    private getProviders(contextSymbols);
    private getDeclarations(contextSymbols);
    private getImports(contextSymbols);
    private getExports(contextSymbols);
    private getBootstrap(contextSymbols);
    private normalizeOptions(options, configFilePath);
    private createProgramFromTsConfig(configFile, overrideFiles?);
    private resourceResolver;
}
