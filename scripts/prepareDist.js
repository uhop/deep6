'use strict';

import * as url from 'url';
import * as path from 'path';
import {promises as fsp} from 'fs';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = async () => {
  const cjsDir = path.join(__dirname, '../cjs');
  await fsp.rm(cjsDir, {recursive: true, force: true});
  await fsp.mkdir(cjsDir);
  await fsp.writeFile(path.join(cjsDir, 'package.json'), '{"type":"commonjs"}');
};

main().then(
  () => console.log('Done.'),
  error => console.error('ERROR:', error)
);
