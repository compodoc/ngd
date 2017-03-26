import * as fs from 'fs-extra';
import * as path from 'path';
import { logger } from '@compodoc/ngd-core';
import { Transformer, Engine } from '../engine';

export class JsonTransformer implements Transformer {
  
  type = 'json';

  transform(deps, options) {
    return new Promise((resolve, reject) => {
      const content = JSON.stringify(deps, null, 2);
      const file = path.join(options.output, '/dependencies.json');
      fs.outputFile(
        file,
        content,
        (error) => {
          if (error) {
            reject(error);
          }
          logger.info('creating JSON', file);
          resolve(file);
        }
      );
    })
  }
}