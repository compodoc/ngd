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
    private getSourceFileDecorators(srcFile, outputSymbols);
    private debug(deps);
    private isComponent(metadata);
    private isModule(metadata);
    private getSymboleName(node);
    private getComponentSelector(props);
    private getModuleProviders(props);
    private findProps(visitedNode);
    private getModuleDeclations(props);
    private getModuleImports(props);
    private getModuleExports(props);
    private getModuleBootstrap(props);
    private getComponentProviders(props);
    private getComponentDirectives(props);
    private parseDeepIndentifier(name);
    private getComponentTemplateUrl(props);
    private getComponentStyleUrls(props);
    private sanitizeUrls(urls);
    private getSymbolDeps(props, type);
    private findComponentSelectorByName(name);
}
