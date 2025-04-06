import fg from 'fast-glob';
import path from 'path';
import { fileURLToPath } from 'url';
import Mocha from 'mocha';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const mocha = new Mocha();

  const testFiles = await fg('tests/**/*.test.js', {
    cwd: __dirname,
    absolute: true,
  });

  console.log('Found test files:', testFiles);

  for (const file of testFiles) {
    mocha.addFile(file);
  }

  mocha.run((failures) => {
    process.exit(failures ? 1 : 0);
  });
})();