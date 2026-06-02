import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const style = fs.readFileSync(path.join(dir, '_style.puml'), 'utf8').trim();

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.puml') && x !== '_style.puml')) {
  let c = fs.readFileSync(path.join(dir, f), 'utf8');
  c = c.replace(/!include \.\/_style\.puml\s*\n?/, `${style}\n\n`);
  fs.writeFileSync(path.join(dir, f), c);
  console.log('inlined', f);
}
