import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';
import { logger, getNewLineCharacter, compilerHost, d } from '@compodoc/ngd-core';
import { Compiler, Dependencies, NodeObject, SymbolDeps } from './compiler';
import {ContextSymbols} from 'ngast';

export class NgAst extends Compiler {
  private program: ts.Program;

  constructor(private files: string[], options: any) {
    super(files, options);
    this.program = this.createProgramFromTsConfig(options.tsconfig);
  }

  getDependencies(): Dependencies[] {
    const contextSymbols = new ContextSymbols(this.program, this.resourceResolver);
    // console.log('getModules::', contextSymbols.getModules().pop());
    fs.writeFileSync(
      './xxxxxxxxx.json', 
      JSON.stringify(contextSymbols.getContextSummary() /*.map( d => d._symbol.name )*/, null, 2)
    );

    // @todo we should return this type
    // {
    //   name,
    //   file: srcFile.fileName.split('/').splice(-3).join('/'),
    //   providers: this.getModuleProviders(props),
    //   declarations: this.getModuleDeclations(props),
    //   imports: this.getModuleImports(props),
    //   exports: this.getModuleExports(props),
    //   bootstrap: this.getModuleBootstrap(props),
    //   __raw: props
    // };

    return [];
  }

  private getFileName(contextSymbols: ContextSymbols) {

  }
  
  private getProviders(contextSymbols: ContextSymbols) {

  }

  private getDeclarations(contextSymbols: ContextSymbols) {

  }

  private getImports(contextSymbols: ContextSymbols) {

  }

  private getExports(contextSymbols: ContextSymbols) {

  }

  private getBootstrap(contextSymbols: ContextSymbols) {

  }

  private normalizeOptions(options: any, configFilePath: string) {
    options.genDir = options.basePath = options.baseUrl;
    options.configFilePath = configFilePath;
  }

  private createProgramFromTsConfig(configFile: string, overrideFiles: string[] = undefined): ts.Program {
    const projectDirectory = path.dirname(configFile);
    const { config } = ts.readConfigFile(configFile, ts.sys.readFile);

    // Any because of different APIs in TypeScript 2.1 and 2.0
    const parseConfigHost: any = {
      fileExists: fs.existsSync,
      readDirectory: ts.sys.readDirectory,
      readFile: (file) => fs.readFileSync(file, 'utf8'),
      useCaseSensitiveFileNames: true,
    };
    const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, projectDirectory);
    parsed.options.baseUrl = parsed.options.baseUrl || projectDirectory;
    this.normalizeOptions(parsed.options, configFile);
    const host = ts.createCompilerHost(parsed.options, true);
    const program = ts.createProgram(overrideFiles || parsed.fileNames, parsed.options, host);

    return program;
  }

  private resourceResolver = {
    get(url: string) {
      return new Promise((resolve, reject) => {
        fs.readFile(url, 'utf-8', (err, content) => {
          if (err) {
            reject(err);
          } else {
            resolve(content);
          }
        });
      });
    },
    getSync(url: string) {
      return fs.readFileSync(url).toString();
    }
  };

}
