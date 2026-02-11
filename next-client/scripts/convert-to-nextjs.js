const fs = require('fs');
const path = require('path');

function findTsxFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(findTsxFiles(full));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      results.push(full);
    }
  }
  return results;
}

// Directories to convert
const dirs = [
  path.join(__dirname, '..', 'components'),
];

let totalFixed = 0;
const allFiles = [];
for (const dir of dirs) {
  allFiles.push(...findTsxFiles(dir));
}

// Exclude files that are already converted (admin/, RootApp.tsx)
const skipFiles = ['RootApp.tsx', 'ConfirmUserBlock.tsx', 'ViewUser.tsx'];

for (const filePath of allFiles) {
  const fileName = path.basename(filePath);
  if (skipFiles.includes(fileName)) {
    console.log(`SKIP (already converted): ${path.relative(process.cwd(), filePath)}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changes = [];

  // 1. Add "use client" if not present
  if (!content.startsWith('"use client"') && !content.startsWith("'use client'")) {
    content = '"use client";\n\n' + content;
    changes.push('+use client');
  }

  // 2. Replace react-router-dom imports
  // useNavigate -> useRouter
  if (content.includes('useNavigate')) {
    content = content.replace(/import\s*\{[^}]*useNavigate[^}]*\}\s*from\s*['"]react-router-dom['"]\s*;?/g, (match) => {
      // Check if there are other imports in this statement
      const otherImports = match.replace(/useNavigate\s*,?\s*/g, '').replace(/,\s*\}/g, '}').replace(/\{\s*,/g, '{').replace(/\{\s*\}/g, '');
      if (otherImports.includes('{') && otherImports.match(/\{[^}]+\}/)) {
        return otherImports + "\nimport { useRouter } from 'next/navigation';";
      }
      return "import { useRouter } from 'next/navigation';";
    });
    // Replace useNavigate() calls
    content = content.replace(/const\s+navigate\s*=\s*useNavigate\(\)\s*;?/g, 'const router = useRouter();');
    // Replace navigate( calls with router.push(
    content = content.replace(/navigate\(\s*(['"`/])/g, 'router.push($1');
    // Replace navigate(-1) with router.back()
    content = content.replace(/navigate\(\s*-1\s*\)/g, 'router.back()');
    changes.push('useNavigate->useRouter');
  }

  // 3. Replace Link from react-router-dom
  if (content.includes("from 'react-router-dom'") || content.includes('from "react-router-dom"')) {
    content = content.replace(/import\s*\{[^}]*Link[^}]*\}\s*from\s*['"]react-router-dom['"]\s*;?/g, (match) => {
      const otherImports = match.replace(/Link\s*,?\s*/g, '').replace(/,\s*\}/g, '}').replace(/\{\s*,/g, '{').replace(/\{\s*\}/g, '');
      if (otherImports.includes('{') && otherImports.match(/\{[^}]+\}/)) {
        return otherImports + "\nimport Link from 'next/link';";
      }
      return "import Link from 'next/link';";
    });
    // Replace <Link to= with <Link href=
    content = content.replace(/<Link\s+to=/g, '<Link href=');
    changes.push('Link->next/link');
  }

  // 4. Catch any remaining react-router-dom imports
  if (content.includes("from 'react-router-dom'") || content.includes('from "react-router-dom"')) {
    content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"]react-router-dom['"]\s*;?/g, (match) => {
      // Extract what's being imported
      const imports = match.match(/\{([^}]+)\}/)?.[1]?.trim();
      if (imports) {
        // Map common react-router-dom imports to next equivalents
        return `// TODO: Replace react-router-dom imports: ${imports}\nimport { useRouter } from 'next/navigation';`;
      }
      return '// Removed react-router-dom import';
    });
    changes.push('cleanup react-router-dom');
  }

  // 5. Replace VITE/NEXT_PUBLIC API base URLs
  // ${import.meta.env.VITE_API_BASE_URL}
  content = content.replace(/\$\{import\.meta\.env\.VITE_API_BASE_URL\}/g, '');
  // import.meta.env.VITE_API_BASE_URL +
  content = content.replace(/import\.meta\.env\.VITE_API_BASE_URL\s*\+\s*/g, '');
  // `${import.meta.env.VITE_API_BASE_URL}/api/...` -> `/api/...`
  content = content.replace(/import\.meta\.env\.VITE_API_BASE_URL/g, '""');
  // ${process.env.NEXT_PUBLIC_API_BASE_URL}
  content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_BASE_URL\}/g, '');
  content = content.replace(/process\.env\.NEXT_PUBLIC_API_BASE_URL\s*\+\s*/g, '');
  content = content.replace(/process\.env\.NEXT_PUBLIC_API_BASE_URL/g, '""');
  if (changes.length === 0 && content.includes('VITE_API')) changes.push('fix API URLs');

  // 6. Fix import paths for utils/store/context
  // ../app/store -> @/lib/store/store
  content = content.replace(/from\s*['"]\.\.\/app\/store['"]/g, "from '@/lib/store/store'");
  content = content.replace(/from\s*['"]\.\.\/\.\.\/app\/store['"]/g, "from '@/lib/store/store'");
  // ../utils/ -> @/lib/utils/
  content = content.replace(/from\s*['"]\.\.\/utils\//g, "from '@/lib/utils/");
  content = content.replace(/from\s*['"]\.\.\/\.\.\/utils\//g, "from '@/lib/utils/");
  // ../context/ -> @/context/
  content = content.replace(/from\s*['"]\.\.\/context\//g, "from '@/context/");
  content = content.replace(/from\s*['"]\.\.\/\.\.\/context\//g, "from '@/context/");
  // For modals importing from ../components/ -> ../ (since they're now in components/modals/)
  // Actually for modals, ../components/X -> ../X
  if (filePath.includes('modals')) {
    content = content.replace(/from\s*['"]\.\.\/components\//g, "from '../");
  }
  // For modals importing from ../modals/ (if any cross-modal imports)
  content = content.replace(/from\s*['"]\.\.\/modals\//g, "from './");
  content = content.replace(/from\s*['"]\.\.\/\.\.\/modals\//g, "from '../modals/");

  // 7. Fix old Express-style API URLs used in components/modals
  const urlReplacements = [
    ['/api/jobs/get-jobs', '/api/jobs'],
    ['/api/jobs/get-ignored-jobs', '/api/jobs/ignored'],
    ['/api/jobs/applied-jobs/', '/api/jobs/applied/user/'],
    ['/api/jobs/get-hired-jobs/', '/api/jobs/hired/'],
    ['/api/jobs/all-technology-names', '/api/jobs/technologies/names'],
    ['/api/jobs/active/', '/api/jobs/technologies/'],
    ['/api/get-all-developers', '/api/developers'],
    ['/api/add-developer', '/api/developers'],
    ['/api/edit-developer/', '/api/developers/'],
    ['/api/delete-developer/', '/api/developers/'],
    ['/api/admin/allusers', '/api/admin/users'],
    ['/api/get-connects/all', '/api/connects/all'],
    ['/api/create-platform', '/api/connects/platform'],
    ['/api/save-connect-cost', '/api/connects/cost'],
    ['/api/admin/user/activity', '/api/admin/users/activity'],
    ['/api/admin/user/', '/api/admin/users/'],
    ['/api/get-target', '/api/targets'],
    ['/api/set-target', '/api/targets'],
    ['/api/get-all-profiles', '/api/profiles'],
    ['/api/jobs/apply-job', '/api/jobs/apply'],
    ['/api/jobs/ignore-job', '/api/jobs/ignore'],
    ['/api/jobs/edit-applied/', '/api/jobs/applied/'],
    ['/api/jobs/change-stage/', '/api/jobs/stage/'],
    ['/api/jobs/hired-job', '/api/jobs/hired'],
    ['/api/portfolios/add', '/api/portfolios'],
    ['/api/portfolios/update/', '/api/portfolios/'],
    ['/api/portfolios/delete/', '/api/portfolios/'],
    ['/api/portfolios/get-user/', '/api/portfolios/user/'],
  ];

  for (const [from, to] of urlReplacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changes.push(`URL: ${from}->${to}`);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');

  if (changes.length > 0) {
    console.log(`FIXED: ${path.relative(process.cwd(), filePath)} [${changes.join(', ')}]`);
    totalFixed++;
  } else {
    console.log(`OK:    ${path.relative(process.cwd(), filePath)}`);
  }
}

console.log(`\nTotal files modified: ${totalFixed}/${allFiles.length}`);
