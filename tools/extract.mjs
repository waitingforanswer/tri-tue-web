import fs from 'node:fs';
import vm from 'node:vm';

const SRC = process.argv[2];
const html = fs.readFileSync(SRC, 'utf8');
const lines = html.split('\n');

const start = lines.findIndex(l => l.startsWith('const CAY = ['));
const end   = lines.findIndex(l => l.startsWith('const $ = s =>'));
if (start < 0 || end < 0) throw new Error('cannot locate data block');
let code = lines.slice(start, end).join('\n');

const names = [...code.matchAll(/^const\s+([A-Z][A-Z0-9_]*)\s*=/gm)].map(m => m[1]);
code = code.replace(/^const\s+([A-Z][A-Z0-9_]*)\s*=/gm, 'globalThis.$1 =');
code += `\nglobalThis.__OUT = {${names.join(',')}};`;

const ctx = vm.createContext({});
vm.runInContext(code, ctx);
const out = ctx.__OUT;

fs.mkdirSync('out', { recursive: true });
fs.writeFileSync('out/prototype-data.json', JSON.stringify(out, null, 2));

const shape = (v, d = 0) => {
  if (Array.isArray(v)) return `[${v.length}]` + (v.length ? shape(v[0], d + 1) : '');
  if (v && typeof v === 'object') {
    if (d > 2) return '{…}';
    return '{' + Object.keys(v).map(k => `${k}:${shape(v[k], d + 1)}`).join(', ') + '}';
  }
  return typeof v === 'string' ? 'str' : typeof v;
};
for (const n of names) console.log(n.padEnd(12), shape(out[n]));
console.log('\nJSON bytes:', fs.statSync('out/prototype-data.json').size);
