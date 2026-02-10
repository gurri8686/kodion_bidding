/**
 * Script to add Vercel route configuration to all API route files
 * Fixes 405 Method Not Allowed errors on Vercel
 */

const fs = require('fs');
const path = require('path');

const ROUTE_CONFIG = `
// Route segment config for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
`;

function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function addRouteConfig(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has runtime config
  if (content.includes('export const runtime')) {
    console.log(`⏭️  Skipped (already configured): ${path.relative(process.cwd(), filePath)}`);
    return false;
  }

  // Find the position after imports (before first export function)
  const exportFunctionMatch = content.match(/export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)/);

  if (!exportFunctionMatch) {
    console.log(`⚠️  Skipped (no export function found): ${path.relative(process.cwd(), filePath)}`);
    return false;
  }

  const insertPosition = exportFunctionMatch.index;

  // Insert route config before first export function
  const newContent =
    content.slice(0, insertPosition) +
    ROUTE_CONFIG +
    '\n' +
    content.slice(insertPosition);

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
  return true;
}

// Find all route.ts files
const apiDir = path.join(__dirname, '..', 'app', 'api');
const routeFiles = findRouteFiles(apiDir);

console.log(`Found ${routeFiles.length} route files\n`);

let updated = 0;
routeFiles.forEach(file => {
  if (addRouteConfig(file)) {
    updated++;
  }
});

console.log(`\n✅ Updated ${updated} files`);
console.log(`⏭️  Skipped ${routeFiles.length - updated} files`);
