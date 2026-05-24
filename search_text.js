const fs = require('fs');
const path = require('path');

function searchDir(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.angular') {
        searchDir(fullPath, query);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.html')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(query)) {
          console.log(`Found in: ${fullPath}`);
        }
      }
    }
  }
}

console.log('Searching for "p-toggleswitch"...');
searchDir('d:/omnicore/OmniCore2.0/src', 'p-toggleswitch');
