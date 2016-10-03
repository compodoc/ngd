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
            name: { text: string };
            text: string;
            elements: NodeObject[],
            expression: NodeObject
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
        templateUrl?: string[];
        styleUrls?: string[];
        providers?: Deps[];
        imports?: Deps[];
        exports?: Deps[];
        declarations?: Deps[];
        bootstrap?: Deps[];
        __raw?: any
    }

    interface SymbolDeps {
      full: string;
      alias: string;
    }

    export class Dependencies {

        private files: string[];
        private program: ts.Program;
        private engine: any;
        private __cache: any = {};
        private __nsModule: any = {};

        constructor(file: string[]) {
            this.files = file;
            this.program = ts.createProgram(this.files, {
                target: ts.ScriptTarget.ES5,
                module: ts.ModuleKind.CommonJS
            });
        }

        getDependencies() {
            let deps: Deps[] = [];
            let sourceFiles = this.program.getSourceFiles() || [];

            sourceFiles.map((file) => {

                let filePath = file.fileName;

                if (path.extname(filePath) === '.ts') {

                    if (filePath.lastIndexOf('.d.ts') === -1) {
                        logger.info('parsing', filePath);

                        try {
                          this.getSourceFileDecorators(file, deps);
                        }
                        catch(e) {
                          logger.fatal('Ouch', filePath);
                          logger.fatal('', e);
                          logger.warn('ignoring', filePath);
                          logger.warn('see error', '');
                          console.trace(e);
                        }
                    }

                }

                return deps;

            });

            return deps;
        }


        private getSourceFileDecorators(srcFile: ts.SourceFile, outputSymbols: Deps[]): void {

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
                              bootstrap: this.getModuleBootstrap(props),
                              __raw: props
                          };
                          outputSymbols.push(deps);
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

                        this.debug(deps);

                        this.__cache[name] = deps;
                    }

                    let filterByDecorators = (node) => /(NgModule|Component)/.test(node.expression.expression.text);

                    node.decorators
                        .filter(filterByDecorators)
                        .forEach(visitNode);
                }
                else {
                    // process.stdout.write('.');
                }

            });

        }
        private debug(deps: Deps) {
          logger.debug('debug', `${deps.name}:`);

          [
            'imports', 'exports', 'declarations', 'providers', 'bootstrap'
          ].forEach( symbols => {
            if (deps[symbols] && deps[symbols].length > 0) {
              logger.debug('', `- ${symbols}:`);
              deps[symbols].map(i=>i.name).forEach( d  => {
                logger.debug('', `\t- ${d}`);
              });

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
            return this.getSymbolDeps(props, 'selector').pop();
        }

        private getModuleProviders(props: NodeObject[]): Deps[] {
          return this.getSymbolDeps(props, 'providers').map((name) => {
              return this.parseDeepIndentifier(name);
          });
        }

        private getModuleDeclations(props: NodeObject[]): Deps[] {
          return this.getSymbolDeps(props, 'declarations').map((name) => {
              let component = this.findComponentSelectorByName(name);

              if(component) {
                return component;
              }

              return this.parseDeepIndentifier(name);
          });
        }

        private getModuleImports(props: NodeObject[]): Deps[] {
          return this.getSymbolDeps(props, 'imports').map((name) => {
              return this.parseDeepIndentifier(name);
          });
        }

        private getModuleExports(props: NodeObject[]): Deps[] {
          return this.getSymbolDeps(props, 'exports').map((name) => {
              return this.parseDeepIndentifier(name);
          });
        }

        private getModuleBootstrap(props: NodeObject[]): Deps[] {
          return this.getSymbolDeps(props, 'bootstrap').map((name) => {
              return this.parseDeepIndentifier(name);
          });
        }

        private getComponentProviders(props: NodeObject[]): Deps[] {
            return this.getSymbolDeps(props, 'providers').map((name) => {
                return this.parseDeepIndentifier(name);
            });
        }

        private getComponentDirectives(props: NodeObject[]): Deps[] {
            return this.getSymbolDeps(props, 'directives').map((name) => {
                let identifier = this.parseDeepIndentifier(name);
                identifier.selector = this.findComponentSelectorByName(name);
                identifier.label = '';
                return identifier;
            });
        }

        private parseDeepIndentifier(name: string): any {
          let nsModule = name.split('.');
          if(nsModule.length > 1) {

            // cache deps with the same namespace (Shared.*)
            if(this.__nsModule[ nsModule[0] ]) {
              this.__nsModule[ nsModule[0] ].push(name)
            }
            else {
              this.__nsModule[ nsModule[0] ] = [name];
            }

            return {
              ns: nsModule[0],
              name
            }
          }
          return {
              name
          };
        }

        private getComponentTemplateUrl(props: NodeObject[]): string[] {
            return this.sanitizeUrls(this.getSymbolDeps(props, 'templateUrl'));
        }

        private getComponentStyleUrls(props: NodeObject[]): string[] {
            return this.sanitizeUrls(this.getSymbolDeps(props, 'styleUrls'));
        }

        private sanitizeUrls(urls: string[]) {
          return urls.map( url => url.replace('./', '') );
        }

        private getSymbolDeps(props: NodeObject[], type: string): string[] {

            let deps = props.filter((node: NodeObject) => {
                return node.name.text === type;
            });

            let parseSymbolText = (text: string) => {
              if (text.indexOf('/') !== -1) {
                  text = text.split('/').pop();
              }
              return [
                text
              ];
            };

            let buildIdentifierName = (node: NodeObject, name='') => {
              if (node.expression) {
                name = name ? `.${name}` : name;
                return `${ buildIdentifierName(node.expression, node.name.text) }${name}`
              }
              return `${node.text}.${name}`;
            }

            let parseSymbolElements = (o: NodeObject | any): string => {
              // parse expressions such as: AngularFireModule.initializeApp(firebaseConfig)
              if (o.arguments) {
                let className = o.expression.expression.text;
                let functionName = o.expression.name.text;

                // function arguments could be really complexe. There are so
                // many use cases that we can't handle. Just print "..." to indicate
                // that we have arguments.
                //
                // let functionArgs = o.arguments.map(arg => arg.text).join(',');

                let functionArgs = o.arguments.length > 0 ? 'args' : '';
                let text = `${className}.${functionName}(${functionArgs})`;
                return text;
              }

              // parse expressions such as: Shared.Module
              else if (o.expression) {
                let identifier = buildIdentifierName(o);
                return identifier;
              }

              return o.text;
            };

            let parseSymbols = (node: NodeObject) => {

                let text = node.initializer.text;
                if (text) {
                  return parseSymbolText(text);
                }

                else if (node.initializer.expression) {
                  let identifier = parseSymbolElements(node.initializer);
                  return [
                    identifier
                  ];
                  // if(node.initializer.expression.expression) {
                  // }
                  // else {
                  //   return [
                  //     `${node.initializer.expression.text}.${node.initializer.name.text}`
                  //   ];
                  // }
                }

                else if (node.initializer.elements) {
                  return node.initializer.elements.map(parseSymbolElements);
                }

            };
            return deps.map(parseSymbols).pop() || [];
        }

        private findComponentSelectorByName(name: string) {
            return this.__cache[name];
        }

    }

}
