/// <reference path="../typings/tsd.d.ts" />

import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';

let q = require('q');

module Ng2Graph.Dependencies {

    interface NodeObject {
        pos: Number;
        end: Number;
        text: string;
        initializer: {
            elements: NodeObject[]
        };
        name?: {text: string};
        expression?: NodeObject;
        arguments?: NodeObject[];
        properties?: any[];
        parserContextFlags?: Number;
        Component?: String;
    }
    
    export class Deps {
        
        constructor() {
            
        }
        
        getDependencies(file: string) {
            
            let program: ts.Program = ts.createProgram([file], {
                target: ts.ScriptTarget.ES5, 
                module: ts.ModuleKind.CommonJS
            });
            
            let defer = q.defer();
            let links: any[] = [];
            program.getSourceFiles().map((file) => {
                
                let filePath = file.fileName;
                
                if(filePath.lastIndexOf('.d.ts') === -1) {
                    console.log('> parsing file     : ', filePath);
                    this.getSourceFileDecorators(file, links);
                    defer.resolve(links);
                    //console.log(JSON.stringify(links, null, 2));
                }
                else {
                    console.log('> ignoring tsd file: ', filePath);
                }
                
            });
            
            return defer.promise;
        }
        
        
        getSourceFileDecorators(srcFile: ts.SourceFile, rawDecorators: any[]): void {
            ts.forEachChild(srcFile, (node: ts.Node) => {
        
                if(node.decorators) {
                    let filterByComponent = (node) => node.expression.expression.text === 'Component';
                    let getComponents = (node) => node.expression.arguments.pop();
                    let getProps = (nodes) => nodes.properties;
                    let visitNode = (props, index) => {
                        
                        let componentName = this.getComponentName(node);
                        let component = {
                            name: componentName,
                            file: srcFile.fileName,
                            directives: this.getComponentDirectives(props),
                            providers: this.getComponentProviders(props)
                        };
                        
                        rawDecorators.push(component);
                    }
                    
                    node.decorators
                        .filter(filterByComponent)
                        .map(getComponents)
                        .map(getProps)
                        .forEach(visitNode);
                }
                else {
                    //process.stdout.write('.');
                }
                
            });
            
        }
        
        getComponentName(node): string {
            return node.name.text;
        }
        
        getComponentProviders(props: any[]): string[] {
            return this.getComponentDeps(props, 'providers');
        }
        
        getComponentDirectives(props: any[]): string[] {
            return this.getComponentDeps(props, 'directives');
        }
        
        getComponentDeps(props: any[], type: string): string[] {
            return props.filter( (node: NodeObject) => {
                return node.name.text === type;
            }).map( (node: NodeObject) => {
                return node.initializer.elements.map((o: NodeObject) => {
                    
                    if(o.arguments) {
                        return o.arguments.shift().text+'*';
                    }
                    return o.text;
                });
            }).pop();
        }
        
    }
    
}

