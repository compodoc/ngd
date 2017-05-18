import { Symbol } from './compiler';
export interface NodeView {
    content: string;
    ast?: {};
}
export interface Symbol {
    name?: string;
    selector?: string;
    label?: string;
    type?: string;
    attrs?: {
        name: string;
        value: string;
    }[];
    file?: string;
    fileName?: string;
    templateUrl?: string[];
    template?: string;
    styleUrls?: string[];
    providers?: Symbol[];
    imports?: Symbol[];
    exports?: Symbol[];
    declarations?: Symbol[];
    bootstrap?: Symbol[];
    id?: string;
    __level?: number;
    __raw?: any;
}
export declare class Compiler {
    private files;
    private program;
    private engine;
    private cachedSymboles;
    private nsModule;
    private depth;
    private includeRawProps;
    private UNKNWON_PARAMS;
    private ANALYZED_DECORATORS;
    private DIRECTIVE_DECORATORS;
    private MODULE_DECORATOR;
    constructor(files: string[], options: any);
    getDependencies(): Symbol[];
    private visitAll(srcFile, outputSymbols);
    private uuid();
    private updateDeclarations(outputSymbols);
    private debug(deps);
    private isDirective(metadata);
    private getSymbolType(metadata);
    private isModule(metadata);
    private getSymboleName(node);
    private getComponentSelector(props);
    private getModuleProviders(props);
    private findProps(visitedNode);
    private updateDirectiveDeclarationsInModules(modules, directiveMetadata);
    private getModuleDeclations(props);
    private getModuleImports(props);
    private getModuleExports(props);
    private getModuleBootstrap(props);
    private getComponentProviders(props);
    private parseDeepIndentifier(name);
    private getComponentTemplateUrl(props);
    private getComponentTemplate(props);
    private getComponentChildren(metadata);
    private getComponentStyleUrls(props);
    private sanitizeUrls(urls);
    private getSymbolDeps(props, type);
    private getDirectiveMetadataByName(name);
    private getDirectiveMetadataBySelector(selector);
}
