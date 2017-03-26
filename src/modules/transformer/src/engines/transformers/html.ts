import fs from 'fs-extra';
import * as path from 'path';
import { logger } from '@compodoc/ngd-core';
import { Transformer, Engine } from '../engine';

export class HtmlTransformer implements Transformer {
  type = 'html';

  transform(deps, options) {
    return new Promise( (resolve, reject) => {
      const content = JSON.stringify(deps, null, 2);
      
      const file = path.join(options.output, '/dependencies.html');
      logger.info('creating HTML', file);
      return resolve();
    });
  }
}