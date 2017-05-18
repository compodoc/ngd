import { Symbol } from './compiler';
import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';
import { logger, getNewLineCharacter, compilerHost, d } from '@compodoc/ngd-core';
import { TemplateCompiler } from './template_compiler';


interface NodeObject {
  kind: Number;
  pos: Number;
  end: Number;
  text: string;
  initializer: NodeObject,
  name?: { text: string };
  expression?: NodeObject;
  elements?: NodeObject[];
  arguments?: NodeObject[];
  properties?: any[];
  parserContextFlags?: Number;
  equalsGreaterThanToken?: NodeObject[];
  parameters?: NodeObject[];
  Component?: String;
  body?: {
    pos: Number;
    end: Number;
    statements: NodeObject[];
  }
}

export interface NodeView {
  content: string;
  ast?: {}
}

export interface Symbol {
  name?: string;
  selector?: string;
  label?: string;
  type?: string;
  attrs?: { name: string; value: string }[];
  file?: string;
  fileName?: string;
  templateUrl?: string[];
  template?: string,
  styleUrls?: string[];
  providers?: Symbol[];
  imports?: Symbol[];
  exports?: Symbol[];
  declarations?: Symbol[];
  bootstrap?: Symbol[];
  id?: string;
  __level?: number;
  __raw?: any
}

interface SymbolDeps {
  full: string;
  alias: string;
}

export class Compiler {

  private files: string[];
  private program: ts.Program;
  private engine: any;
  private cachedSymboles: Map<string, Symbol> = new Map();
  private nsModule: any = {};
  private depth = 1;
  private includeRawProps = false;

  private UNKNWON_PARAMS = '???';
  private ANALYZED_DECORATORS = /(NgModule|Component|Directive|Pipe)/;
  private DIRECTIVE_DECORATORS = ['Component', 'Directive'];
  private MODULE_DECORATOR = 'NgModule';

  constructor(files: string[], options: any) {
    this.files = files;
    const transpileOptions = {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
      tsconfigDirectory: options.tsconfigDirectory
    };
    this.program = ts.createProgram(this.files, transpileOptions, compilerHost(transpileOptions));
  }

  getDependencies() {
    let deps: Symbol[] = [];
    this.depth = 1;
    let sourceFiles = this.program.getSourceFiles() || [];

    sourceFiles.map((file: ts.SourceFile) => {

      let filePath = file.fileName;

      if (path.extname(filePath) === '.ts') {

        if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
          logger.info('parsing', filePath);

          try {
            this.visitAll(file, deps);
          }
          catch (e) {
            logger.trace(e, file.fileName);
          }
        }

      }

      return deps;

    });

    // do one last pass to update all declarations definition
    deps = this.updateDeclarations(deps);
    return deps;
  }


  private visitAll(srcFile: ts.SourceFile, outputSymbols: Symbol[]): void {

    ts.forEachChild(srcFile, (node: ts.Node) => {

      if (node.decorators) {

        let visitNode = (visitedNode, index) => {

          let name = this.getSymboleName(node);
          let file = srcFile.fileName.split('/').splice(-3).join('/');
          let fileName = srcFile.fileName;
          let id = this.uuid();
          let moduleDeps: Symbol = {} as Symbol;
          let directivesDeps: Symbol = {} as Symbol;
          let metadata = node.decorators.pop();
          let props = this.findProps(visitedNode);
          let type = this.getSymbolType(metadata);
          let __level = this.depth;

          // pre-cache
          if (!this.cachedSymboles.has(name)) {
            this.cachedSymboles.set(name, {
              name,
              id,
              type
            });
          }

          if (this.isModule(metadata)) {

            moduleDeps = {
              name,
              id,
              file,
              type,
              fileName,
              __level,
              providers: this.getModuleProviders(props),
              declarations: this.getModuleDeclations(props),
              imports: this.getModuleImports(props),
              exports: this.getModuleExports(props),
              bootstrap: this.getModuleBootstrap(props),
            };

            if (this.includeRawProps) {
              moduleDeps.__raw = props;
            }

            // post-cache
            this.cachedSymboles.set(name, moduleDeps);

            // we only push modules to output
            outputSymbols.push(moduleDeps);
            this.debug(moduleDeps);

          }
          else if (this.isDirective(metadata)) {

            directivesDeps = {
              name,
              id,
              file,
              type,
              fileName,
              __level,
              selector: this.getComponentSelector(props),
              providers: this.getComponentProviders(props),
              templateUrl: this.getComponentTemplateUrl(props),
              template: this.getComponentTemplate(props),
              declarations: [ /* see updateDeclaration() */],
              styleUrls: this.getComponentStyleUrls(props),
            };

            if (this.includeRawProps) {
              directivesDeps.__raw = props;
            }

            // post-cache
            this.cachedSymboles.set(name, directivesDeps);

          }
          this.depth++;
        }

        let filterByDecorators = (node) => {
          if (node.expression && node.expression.expression) {
            return this.ANALYZED_DECORATORS.test(node.expression.expression.text)
          }
          return false;
        };

        node.decorators
          .filter(filterByDecorators)
          .forEach(visitNode);
      }
      else {
        // logger.debug('skip', `non-metadata`);
      }

    });

  }

  private uuid(): string {
    let uuid = '', i, random;
    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i == 8 || i == 12 || i == 16 || i == 20) {
        uuid += '-';
      }
      uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
  }

  private updateDeclarations(outputSymbols: Symbol[]) {

    Array.from(this.cachedSymboles.keys()).map(directiveName => {
      const directive = this.cachedSymboles.get(directiveName);
      if (directive.type === 'component') {
        outputSymbols = this.updateDirectiveDeclarationsInModules(outputSymbols, directive);
      }
    });

    outputSymbols.map(moduleSymbol => {
      return moduleSymbol.declarations.map(directiveSymbol => {
        return directiveSymbol.declarations = this.getComponentChildren(directiveSymbol);
      })
    })
    return outputSymbols;
  }

  private debug(deps: Symbol) {
    logger.debug('debug', `${deps.name}:`);

    [
      'imports', 'exports', 'declarations', 'providers', 'bootstrap'
    ].forEach(symbols => {
      if (deps[symbols] && deps[symbols].length > 0) {
        logger.debug('', `- ${symbols}:`);
        deps[symbols].map(i => i.name).forEach(d => {
          logger.debug('', `\t- ${d}`);
        });

      }
    });
  }

  private isDirective(metadata) {
    const text = metadata.expression.expression.text;
    return this.DIRECTIVE_DECORATORS.indexOf(text) >= 0;
  }

  private getSymbolType(metadata): string {
    return metadata.expression.expression.text.toLowerCase();
  }

  private isModule(metadata) {
    return metadata.expression.expression.text === this.MODULE_DECORATOR;
  }

  private getSymboleName(node): string {
    return node.name.text;
  }

  private getComponentSelector(props: NodeObject[]): string {
    return this.getSymbolDeps(props, 'selector').pop();
  }

  private getModuleProviders(props: NodeObject[]): Symbol[] {
    return this.getSymbolDeps(props, 'providers').map((providerName) => {
      const symbol = this.parseDeepIndentifier(providerName) as Symbol;
      symbol.type = 'provider';
      return symbol;
    });
  }

  private findProps(visitedNode) {
    return visitedNode.expression.arguments.pop().properties;
  }

  private updateDirectiveDeclarationsInModules(modules: Symbol[], directiveMetadata: Symbol): Symbol[] {
    return modules.map(module => {
      const moduleDeclarations = module.declarations;
      for (let index = 0; index < moduleDeclarations.length; index++) {
        if (moduleDeclarations[index].name === directiveMetadata.name) {

          // clone directiveMetadata
          for (let prop in directiveMetadata) {
            if (directiveMetadata.hasOwnProperty(prop)) {
              moduleDeclarations[index][prop] = directiveMetadata[prop];
            }
          }
          break;
        }
      }
      module.declarations = moduleDeclarations;
      return module;
    });
  }

  private getModuleDeclations(props: NodeObject[]): Symbol[] {
    return this.getSymbolDeps(props, 'declarations').map((name) => {
      let component = this.getDirectiveMetadataByName(name);

      if (component) {
        return component;
      }

      const symbol = this.parseDeepIndentifier(name) as Symbol;
      let type = 'pipe';
      if (this.getComponentTemplate(props) || this.getComponentTemplateUrl(props)) {
        type = 'component';
      }
      symbol.type = type;
      return symbol;
    });
  }

  private getModuleImports(props: NodeObject[]): Symbol[] {
    return this.getSymbolDeps(props, 'imports').map((name) => {
      const symbol = this.parseDeepIndentifier(name) as Symbol;
      symbol.type = 'module';
      return symbol;
    });
  }

  private getModuleExports(props: NodeObject[]): Symbol[] {
    return this.getSymbolDeps(props, 'exports').map((name) => {
      return this.parseDeepIndentifier(name);
    });
  }

  private getModuleBootstrap(props: NodeObject[]): Symbol[] {
    return this.getSymbolDeps(props, 'bootstrap').map((name) => {
      return this.parseDeepIndentifier(name);
    });
  }

  private getComponentProviders(props: NodeObject[]): Symbol[] {
    return this.getSymbolDeps(props, 'providers').map((name) => {
      const symbol = this.parseDeepIndentifier(name) as Symbol;
      symbol.type = 'provider';
      return symbol;
    });
  }

  private parseDeepIndentifier(name: string): any {
    let nsModule = name.split('.');
    if (nsModule.length > 1) {

      // cache deps with the same namespace (i.e Shared.*)
      if (this.nsModule[nsModule[0]]) {
        this.nsModule[nsModule[0]].push(name)
      }
      else {
        this.nsModule[nsModule[0]] = [name];
      }

      return {
        ns: nsModule[0],
        name,
        id: this.uuid(),
        __level: this.depth
      }
    }

    let id = this.uuid();
    if (this.cachedSymboles.has(name)) {
      // don't generate a new "id"
      // get "id" from previously stored module
      id = this.cachedSymboles.get(name).id;
    }

    return {
      name,
      id,
      __level: this.depth
    };
  }

  private getComponentTemplateUrl(props: NodeObject[]): string[] {
    return this.sanitizeUrls(this.getSymbolDeps(props, 'templateUrl'));
  }

  private getComponentTemplate(props: NodeObject[]): string {
    return this.getSymbolDeps(props, 'template').pop();
  }

  private getComponentChildren(metadata: Symbol): Symbol[] {
    let content = metadata.template;
    if (content === undefined) {

      // handle Pipes
      if (metadata.fileName) {
        const dirname = path.dirname(metadata.fileName);
        content = metadata.templateUrl.map(templateUrl => {
          templateUrl = path.resolve(dirname, templateUrl);
          return fs.readFileSync(templateUrl, 'utf-8').toString();
        }).pop();
      }
    }

    if (content) {
      const ast = TemplateCompiler.getTemplateAst(content);
      const astOutput = new Map<string, Symbol>();

      const reVisit = (ast: Symbol[], astOutput: Map<string, Symbol>): void => {
        if (ast) {
          ast.map(metadata => {
            if (metadata && metadata.selector) {
              const directiveMetadata = this.getDirectiveMetadataBySelector(metadata.selector);
              if (directiveMetadata) {
                directiveMetadata.__level = this.depth + 1;
                astOutput.set(directiveMetadata.name, directiveMetadata);
              }
              return reVisit(metadata.declarations, astOutput);
            }
            return metadata;
          }).filter(node => node !== null);
        }
      }

      reVisit(ast, astOutput);
      return Array.from(astOutput.values());
    }

    return [];
  }

  private getComponentStyleUrls(props: NodeObject[]): string[] {
    return this.sanitizeUrls(this.getSymbolDeps(props, 'styleUrls'));
  }

  private sanitizeUrls(urls: string[]) {
    return urls.map(url => url.replace('./', ''));
  }

  private getSymbolDeps(props: NodeObject[], type: string): string[] {

    let deps = props.filter((node: NodeObject) => {
      return node.name.text === type;
    });

    let parseSymbolText = (text: string) => {
      if (type !== 'template') {
        if (text.indexOf('/') !== -1) {
          text = text.split('/').pop();
        }
      }
      return [
        text
      ];
    };

    let buildIdentifierName = (node: NodeObject, name = '') => {

      if (node.expression) {
        name = name ? `.${name}` : name;

        let nodeName = this.UNKNWON_PARAMS;
        if (node.name) {
          nodeName = node.name.text;
        }
        else if (node.text) {
          nodeName = node.text;
        }
        else if (node.expression) {

          if (node.expression.text) {
            nodeName = node.expression.text;
          }
          else if (node.expression.elements) {

            if (node.expression.kind === ts.SyntaxKind.ArrayLiteralExpression) {
              nodeName = node.expression.elements.map(el => el.text).join(', ');
              nodeName = `[${nodeName}]`;
            }

          }
        }

        if (node.kind === ts.SyntaxKind.SpreadElement) {
          return `...${nodeName}`;
        }
        return `${buildIdentifierName(node.expression, nodeName)}${name}`
      }

      return `${node.text}.${name}`;
    }

    let parseProviderConfiguration = (o: NodeObject): string => {
      // parse expressions such as:
      // { provide: APP_BASE_HREF, useValue: '/' },
      // or
      // { provide: 'Date', useFactory: (d1, d2) => new Date(), deps: ['d1', 'd2'] }

      let _genProviderName: string[] = [];
      let _providerProps: string[] = [];

      (o.properties || []).forEach((prop: NodeObject) => {

        let identifier = prop.initializer.text;
        if (prop.initializer.kind === ts.SyntaxKind.StringLiteral) {
          identifier = `'${identifier}'`;
        }

        // lambda function (i.e useFactory)
        if (prop.initializer.body) {
          let params = (prop.initializer.parameters || <any>[]).map((params: NodeObject) => params.name.text);
          identifier = `(${params.join(', ')}) => {}`;
        }

        // factory deps array
        else if (prop.initializer.elements) {
          let elements = (prop.initializer.elements || []).map((n: NodeObject) => {

            if (n.kind === ts.SyntaxKind.StringLiteral) {
              return `'${n.text}'`;
            }

            return n.text;
          });
          identifier = `[${elements.join(', ')}]`;
        }

        _providerProps.push([

          // i.e provide
          prop.name.text,

          // i.e OpaqueToken or 'StringToken'
          identifier

        ].join(': '));

      });

      return `{ ${_providerProps.join(', ')} }`;
    }

    let parseSymbolElements = (o: NodeObject | any): string => {
      // parse expressions such as: AngularFireModule.initializeApp(firebaseConfig)
      if (o.arguments) {
        let className = buildIdentifierName(o.expression);

        // function arguments could be really complexe. There are so
        // many use cases that we can't handle. Just print "args" to indicate
        // that we have arguments.

        let functionArgs = o.arguments.length > 0 ? 'args' : '';
        let text = `${className}(${functionArgs})`;
        return text;
      }

      // parse expressions such as: Shared.Module
      else if (o.expression) {
        let identifier = buildIdentifierName(o);
        return identifier;
      }

      return o.text ? o.text : parseProviderConfiguration(o);
    };

    let parseSymbols = (node: NodeObject): string[] => {

      let text = node.initializer.text;
      if (text) {
        return parseSymbolText(text);
      }

      else if (node.initializer.expression) {
        let identifier = parseSymbolElements(node.initializer);
        return [
          identifier
        ];
      }

      else if (node.initializer.elements) {
        return node.initializer.elements.map(parseSymbolElements);
      }

    };
    return deps.map(parseSymbols).pop() || [];
  }

  private getDirectiveMetadataByName(name: string) {
    return this.cachedSymboles.get(name);
  }

  private getDirectiveMetadataBySelector(selector: string): Symbol {
    return Array.from(this.cachedSymboles.values()).filter(s => s.selector === selector).pop();
  }

}
