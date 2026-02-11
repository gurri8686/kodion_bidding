const fs = require('fs');
const path = require('path');

function findRouteFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(findRouteFiles(full));
    } else if (item === 'route.ts') {
      results.push(full);
    }
  }
  return results;
}

const config = "export const runtime = 'nodejs';\nexport const dynamic = 'force-dynamic';\n";
const files = findRouteFiles(path.join(__dirname, '..', 'app', 'api'));
let fixed = 0;

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('export const runtime')) {
    const match = content.match(/(export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)|export\s+const\s+(GET|POST|PUT|DELETE|PATCH))/);
    if (match) {
      const idx = content.indexOf(match[0]);
      content = content.slice(0, idx) + config + '\n' + content.slice(idx);
      fs.writeFileSync(f, content, 'utf8');
      fixed++;
      console.log('FIXED: ' + path.relative(process.cwd(), f));
    } else {
      console.log('WARN:  ' + path.relative(process.cwd(), f) + ' (no export found)');
    }
  } else {
    console.log('SKIP:  ' + path.relative(process.cwd(), f));
  }
}
console.log('\nFixed: ' + fixed + '/' + files.length);
