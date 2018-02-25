import * as path from 'path';
import { JsonTransformer, HtmlTransformer } from './transformers';
import { logger } from '@compodoc/ngd-core';

export interface Options {
  name?: string;
  output?: string;
  outputFormats?: string;
}

export interface Transformer {
  type: string;
  transform(deps: any, options: Options): Promise<string>;
}

let appName = require(path.resolve(process.cwd(), './package.json')).name;

export class Engine {

  cwd = process.cwd();

  files = {
    component: null
  };

  transformers: Transformer[] = [];

  options: Options = {};

  constructor(options: Options) {

    let baseDir = `./${appName}/`;

    this.options = {
      name: `${appName}`,
      output: options.output,
      outputFormats: options.outputFormats
    };

    if (options.output) {

      if (typeof this.options.output !== 'string') {
        logger.fatal('Option "output" has been provided but it is not a valid name.');
        process.exit(1);
      }
    }
  }

  registerTransformers(transformer: Transformer | Transformer[]) {
    if (Array.isArray(transformer)) {
      this.transformers.push(...transformer);
    }
    else {
      this.transformers.push(transformer);
    }

  }

  transform(deps): Promise<string[]> {
    let t: Promise<string>[] = [];

    this.transformers.forEach(trans => {
      if (this.options.outputFormats.indexOf(trans.type) > -1) {
        t.push(trans.transform(deps, this.options));
      }
    });

    return Promise.all(t);
  }

}

export class DefaultEngine extends Engine {

  constructor(options: Options) {
    super(options);
  }

  transform(deps) {
    super.registerTransformers([
      new JsonTransformer(),
      new HtmlTransformer()
    ]);
    return super.transform(deps);
  }
}