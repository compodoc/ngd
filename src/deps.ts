import * as path from "path";
import * as fs from "fs";
import * as ts from "typescript";

interface NodeObject {
    pos: Number;
    end: Number;
    expression?: NodeObject;
    arguments?: NodeObject[];
    properties?: any[];
    parserContextFlags?: Number;
    Component?: String;
}

export function getDependencies(program: ts.Program): void {
    var links: any = {};
    program.getSourceFiles().map((file) => {
        
        let filePath = file.fileName;
        
        if(filePath.lastIndexOf('.d.ts') === -1) {
            console.log('computing file   : ', filePath);
            getSourceFileDecorators(file, links);
            //console.log(JSON.stringify(links, null, 2));
        }
        else {
            console.log('ignoring tsd file: ', filePath);
        }
        
    });
    
    return links;
    
}


function getSourceFileDecorators(srcFile: ts.SourceFile, rawDecorators: any): void {
    ts.forEachChild(srcFile, (node: ts.Node) => {

        if(node.decorators) {
            let filterByComponent = (node) => node.expression.expression.text === 'Component';
            let getComponents = (node) => node.expression.arguments.pop();
            let getProps = (nodes) => nodes.properties;
            let visitNode = (props, index) => {
                
                let componentName = getComponentName(node);
                rawDecorators[ srcFile.fileName ] = rawDecorators[ srcFile.fileName ]||{};
                rawDecorators[ srcFile.fileName ][ componentName ] = props;
                
                /*
                .map((prop) => {
                    return {
                        key: prop.name.text,
                        value: prop.initializer.text 
                            || prop.initializer.elements.map((o) => o.text)
                    };
                })
                */
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