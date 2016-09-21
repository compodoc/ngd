import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as ts from 'typescript';
import { logger } from '../../../logger';

let q = require('q');

let d = (node) => {
  console.log(util.inspect(node, { showHidden: true, depth: 10 }));
};

export namespace Crawler {

    interface NodeObject {
        pos: Number;
        end: Number;
        text: string;
        initializer: {
            text: string;
            elements: NodeObject[]
        };
        name?: { text: string };
        expression?: NodeObject;
        arguments?: NodeObject[];
        properties?: any[];
        parserContextFlags?: Number;
        Component?: String;
    }

    interface Deps {
        name: string;
        selector?: string;
        label?: string;
        file?: string;
        providers?: string[];
        templateUrl?: string[];
        styleUrls?: string[];
        imports?: string[];
        exports?: string[];
        declarations?: string[];
        bootstrap?: string[];
    }

    export class Dependencies {

        private files: string[];
        private program: ts.Program;
        private engine: any;
        private cache: any = {};

        constructor(file: string[]) {
            this.files = file;
            this.program = ts.createProgram(this.files, {
                target: ts.ScriptTarget.ES5,
                module: ts.ModuleKind.CommonJS
            });
        }

        getDependencies() {
            let deps: Deps[] = [];
            this.program.getSourceFiles().map((file) => {

                let filePath = file.fileName;

                if (path.extname(filePath) === '.ts') {

                    if (filePath.lastIndexOf('.d.ts') === -1) {
                        logger.info('parsing', filePath);
                        this.getSourceFileDecorators(file, deps);
                    }

                }

                return deps;

            });

            return deps;
        }


        private getSourceFileDecorators(srcFile: ts.SourceFile, rawDecorators: Deps[]): void {
            ts.forEachChild(srcFile, (node: ts.Node) => {

                if (node.decorators) {

                    let visitNode = (visitedNode, index) => {

                        let name = this.getSymboleName(node);
                        let deps: Deps = <Deps>{};
                        let metadata = node.decorators.pop();
                        let props = visitedNode.expression.arguments.pop().properties;

                        if(this.isModule(metadata)) {
                          deps = {
                              name,
                              file: srcFile.fileName.split('/').splice(-3).join('/'),
                              providers: this.getModuleProviders(props),
                              declarations: this.getModuleDeclations(props),
                              imports: this.getModuleImports(props),
                              exports: this.getModuleExports(props),
                              bootstrap: this.getModuleBootstrap(props)
                              __raw: props
                          };
                          rawDecorators.push(deps);
                        }
                        else if (this.isComponent(metadata)) {
                          deps = {
                              name,
                              file: srcFile.fileName.split('/').splice(-3).join('/'),
                              selector: this.getComponentSelector(props),
                              providers: this.getComponentProviders(props),
                              templateUrl: this.getComponentTemplateUrl(props),
                              styleUrls: this.getComponentStyleUrls(props),
                              __raw: props
                          };

                        }

                        this.cache[name] = deps;
                    }

                    let filterByDecorators = (node) => /(NgModule|Component)/.test(node.expression.expression.text);

                    node.decorators
                        .filter(filterByDecorators)
                        .forEach(visitNode);
                }
                else {
                    //process.stdout.write('.');
                }

            });

        }

        private isComponent(metadata) {
          return metadata.expression.expression.text === 'Component';
        }

        private isModule(metadata) {
          return metadata.expression.expression.text === 'NgModule';
        }

        private getSymboleName(node): string {
            return node.name.text;
        }

        private getComponentSelector(props: NodeObject[]): string {
            return this.getComponentDeps(props, 'selector').pop();
        }

        private getModuleProviders(props: NodeObject[]): Deps[] {
          return this.getComponentDeps(props, 'providers').map((name) => {
              return {
                  name
              }
          });
        }

        private getModuleDeclations(props: NodeObject[]): Deps[] {
          return this.getComponentDeps(props, 'declarations').map((name) => {
              let component = this.cache[name];

              if(component) {
                return component;
              }

              return {name}
          });
        }

        private getModuleImports(props: NodeObject[]): Deps[] {
          return this.getComponentDeps(props, 'imports').map((name) => {
              return {
                  name
              }
          });
        }

        private getModuleExports(props: NodeObject[]): Deps[] {
          return this.getComponentDeps(props, 'exports').map((name) => {
              return {
                  name
              }
          });
        }

        private getModuleBootstrap(props: NodeObject[]): Deps[] {
          return this.getComponentDeps(props, 'bootstrap').map((name) => {
              return {
                  name
              }
          });
        }

        private getComponentProviders(props: NodeObject[]): Deps[] {
            return this.getComponentDeps(props, 'providers').map((name) => {
                return {
                    name
                }
            });
        }

        private getComponentDirectives(props: NodeObject[]): Deps[] {
            return this.getComponentDeps(props, 'directives').map((name) => {
                return {
                    name,
                    label: '',
                    selector: this.findComponentSelectorByName(name)
                }
            });
        }

        private getComponentTemplateUrl(props: NodeObject[]): string[] {
            return this.sanitizeUrls(this.getComponentDeps(props, 'templateUrl'));
        }

        private getComponentStyleUrls(props: NodeObject[]): string[] {
            return this.sanitizeUrls(this.getComponentDeps(props, 'styleUrls'));
        }

        private sanitizeUrls(urls: string[]) {
          return urls.map( url => url.replace('./', '') );
        }

        private getComponentDeps(props: NodeObject[], type: string): string[] {

            return props.filter((node: NodeObject) => {
                return node.name.text === type;
            }).map((node: NodeObject) => {

                let text = node.initializer.text;
                if (text) {

                    if (text.indexOf('/') !== -1) {
                        text = text.split('/').pop();
                    }

                    return [text];
                }

                return node.initializer.elements.map((o: NodeObject) => {
                    if (o.arguments) {
                        return o.arguments.shift().text + '*';
                    }
                    return o.text;
                });

            }).pop() || [];
        }

        private findComponentSelectorByName(name: string) {
            return this.cache[name];
        }

    }

}
