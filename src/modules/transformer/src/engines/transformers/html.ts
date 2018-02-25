import * as fs from 'fs-extra';
import * as path from 'path';
import { logger } from '@compodoc/ngd-core';
import { Transformer, Engine } from '../engine';

import { html as vis } from './html-vis';
import { html as dagre } from './html-dagre';

export class HtmlTransformer implements Transformer {
  type = 'html';

  async transform(deps, options) {
    let content = JSON.stringify(deps, null, 2);
    content = dagre(content);

    const file = path.join(options.output, '/dependencies.html');
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