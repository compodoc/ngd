import * as fs from 'fs-extra';
import * as path from 'path';
import { logger } from '@compodoc/ngd-core';
import { Transformer, Engine } from '../engine';

export class JsonTransformer implements Transformer {
  
  type = 'json';

  async transform(deps, options) {
    const content = JSON.stringify(deps, null, 2);
    const file = path.join(options.output, '/dependencies.json');
    return await new Promise<string>( (resolve, reject) => {
      fs.outputFile(
        file,
        content,
        async (error) => {
          if (error) {
            await Promise.reject(error);
          }
          logger.info('creating JSON', file);
          await Promise.resolve(file);
        }
      );
    });
  }
}