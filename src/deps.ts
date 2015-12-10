import * as path from "path";
import * as fs from "fs";
import * as ts from "typescript";

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

export function getDependencies(program: ts.Program): any[] {
    var links: any[] = [];
    program.getSourceFiles().map((file) => {
        
        let filePath = file.fileName;
        
        if(filePath.lastIndexOf('.d.ts') === -1) {
            console.log('> parsing file   : ', filePath);
            getSourceFileDecorators(file, links);
            //console.log(JSON.stringify(links, null, 2));
        }
        else {
            console.log('> ignoring tsd file: ', filePath);
        }
        
    });
    
    return links;
    
}


function getSourceFileDecorators(srcFile: ts.SourceFile, rawDecorators: any[]): void {
    ts.forEachChild(srcFile, (node: ts.Node) => {

        if(node.decorators) {
            let filterByComponent = (node) => node.expression.expression.text === 'Component';
            let getComponents = (node) => node.expression.arguments.pop();
            let getProps = (nodes) => nodes.properties;
            let visitNode = (props, index) => {
                
                let componentName = getComponentName(node);
                let component = {
                    name: componentName,
                    file: srcFile.fileName,
                    directives: getComponentDirectives(props),
                    providers: getComponentProviders(props)
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

function getComponentName(node): string {
    return node.name.text;
}

function getComponentProviders(props: any[]): string[] {
    return getComponentDeps(props, 'providers');
}

function getComponentDirectives(props: any[]): string[] {
    return getComponentDeps(props, 'directives');
}

function getComponentDeps(props: any[], type: string): string[] {
    
    console.log(JSON.stringify(props, null, 2));
    
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

