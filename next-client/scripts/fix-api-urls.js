const fs = require('fs');
const path = require('path');

// All URL replacements needed
const replacements = [
  // Jobs page
  { file: 'app/(dashboard)/jobs/page.tsx', from: '/api/jobs/get-jobs', to: '/api/jobs' },
  // Ignored jobs page
  { file: 'app/(dashboard)/ignored-jobs/page.tsx', from: '/api/jobs/get-ignored-jobs', to: '/api/jobs/ignored' },
  // Applied jobs page
  { file: 'app/(dashboard)/applied-jobs/page.tsx', from: '/api/jobs/applied-jobs/', to: '/api/jobs/applied/user/' },
  // Hired jobs page
  { file: 'app/(dashboard)/hired-jobs/page.tsx', from: '/api/jobs/get-hired-jobs/', to: '/api/jobs/hired/' },
  // Settings page - technology names
  { file: 'app/(dashboard)/settings/page.tsx', from: '/api/jobs/all-technology-names', to: '/api/jobs/technologies/names' },
  // Settings page - active technologies
  { file: 'app/(dashboard)/settings/page.tsx', from: '/api/jobs/active/', to: '/api/jobs/technologies/' },
  // Developers page
  { file: 'app/(dashboard)/developers/page.tsx', from: '/api/get-all-developers', to: '/api/developers' },
  { file: 'app/(dashboard)/developers/page.tsx', from: '/api/add-developer', to: '/api/developers' },
  { file: 'app/(dashboard)/developers/page.tsx', from: '/api/edit-developer/', to: '/api/developers/' },
  { file: 'app/(dashboard)/developers/page.tsx', from: '/api/delete-developer/', to: '/api/developers/' },
  // Admin portfolios page
  { file: 'app/(dashboard)/admin/portfolios/page.tsx', from: '/api/admin/allusers', to: '/api/admin/users' },
  { file: 'app/(dashboard)/admin/portfolios/page.tsx', from: '/api/jobs/all-technology-names', to: '/api/jobs/technologies/names' },
  // Admin connects page
  { file: 'app/(dashboard)/admin/connects/page.tsx', from: '/api/get-connects/all', to: '/api/connects/all' },
  // Admin connect-cost page
  { file: 'app/(dashboard)/admin/connect-cost/page.tsx', from: '/api/create-platform', to: '/api/connects/platform' },
  { file: 'app/(dashboard)/admin/connect-cost/page.tsx', from: '/api/save-connect-cost', to: '/api/connects/cost' },
  // Admin activity page
  { file: 'app/(dashboard)/admin/activity/page.tsx', from: '/api/admin/user/activity', to: '/api/admin/users/activity' },
  // Admin user-jobs page
  { file: 'app/(dashboard)/admin/user-jobs/[userId]/page.tsx', from: '/api/admin/user/', to: '/api/admin/users/' },
  // Admin progress page
  { file: 'app/(dashboard)/admin/progress/page.tsx', from: '/api/get-target', to: '/api/targets' },
  { file: 'app/(dashboard)/admin/progress/page.tsx', from: '/api/set-target', to: '/api/targets' },
  // Admin logs page
  { file: 'app/(dashboard)/admin/logs/[userId]/page.tsx', from: '/api/admin/logs/', to: '/api/admin/logs/' },
  // DashboardFilters component
  { file: 'components/admin/DashboardFilters.tsx', from: '/api/admin/allusers', to: '/api/admin/users' },
  { file: 'components/admin/DashboardFilters.tsx', from: '/api/get-all-profiles', to: '/api/profiles' },
];

let totalFixed = 0;

for (const r of replacements) {
  const filePath = path.join(__dirname, '..', r.file);

  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${r.file}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes(r.from)) {
    content = content.split(r.from).join(r.to);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`FIXED: ${r.file} (${r.from} → ${r.to})`);
    totalFixed++;
  } else {
    console.log(`SKIP (already correct): ${r.file} - ${r.from}`);
  }
}

console.log(`\nTotal fixed: ${totalFixed}`);
