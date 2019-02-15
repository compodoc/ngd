export interface Dependencies {
    name: string;
    selector?: string;
    label?: string;
    file?: string;
    templateUrl?: string[];
    styleUrls?: string[];
    providers?: Dependencies[];
    imports?: Dependencies[];
    exports?: Dependencies[];
    declarations?: Dependencies[];
    bootstrap?: Dependencies[];
    __raw?: any;
}
export declare class Compiler {
    private files;
    private program;
    private engine;
    private __cache;
    private __nsModule;
    private unknown;
    constructor(files: string[], options: any);
    getDependencies(): Dependencies[];
    private getSourceFileDecorators;
    private debug;
    private isComponent;
    private isModule;
    private getSymboleName;
    private getComponentSelector;
    private getModuleProviders;
    private findProps;
    private getModuleDeclations;
    private getModuleImports;
    private getModuleExports;
    private getModuleBootstrap;
    private getComponentProviders;
    private getComponentDirectives;
    private parseDeepIndentifier;
    private getComponentTemplateUrl;
    private getComponentStyleUrls;
    private sanitizeUrls;
    private getSymbolDeps;
    private findComponentSelectorByName;
}
