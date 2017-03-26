import { Symbol } from './compiler';
export interface NodeView {
    content: string;
    ast?: {};
}
export interface Symbol {
    name?: string;
    selector?: string;
    label?: string;
    attrs?: {
        name: string;
        value: string;
    }[];
    file?: string;
    srcFile?: string;
    templateUrl?: string[];
    template?: string;
    styleUrls?: string[];
    providers?: Symbol[];
    imports?: Symbol[];
    exports?: Symbol[];
    declarations?: Symbol[];
    bootstrap?: Symbol[];
    __raw?: any;
}
export declare class Compiler {
    private files;
    private program;
    private engine;
    private __directivesCache;
    private __nsModule;
    private unknown;
    constructor(files: string[], options: any);
    getDependencies(): Symbol[];
    private visitAll(srcFile, outputSymbols);
    private updateDeclarations(outputSymbols);
    private debug(deps);
    private isDirective(metadata);
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
    private getDirectiveNameBySelector(selector);
}
