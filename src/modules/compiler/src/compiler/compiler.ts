import * as path from 'path';
import * as ts from 'typescript';
import {logger, getNewLineCharacter, compilerHost, d } from '@compodoc/ngd-core';

export interface NodeObject {
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
  __raw?: any
}

export interface SymbolDeps {
  full: string;
  alias: string;
}

export abstract class Compiler {

  constructor(files: string[], options: any) {}

  abstract getDependencies(): Dependencies[];

}
