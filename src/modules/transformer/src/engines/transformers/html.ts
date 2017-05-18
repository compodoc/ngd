import * as fs from 'fs-extra';
import * as path from 'path';
import { logger } from '@compodoc/ngd-core';
import { Transformer, Engine } from '../engine';

import { html as vis } from './html-vis';
import { html as dagre } from './html-dagre';

export class HtmlTransformer implements Transformer {
  type = 'html';

  transform(deps, options) {
    return new Promise((resolve, reject) => {
      const content = dagre(deps);
      const file = path.join(options.output, '/dependencies.html');
      fs.outputFile(
        file,
        content,
        (error) => {
          if (error) {
            reject(error);
          }
          logger.info('output HTML', file);
          resolve(file);
        }
      );
    })
  }
}