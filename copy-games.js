const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  // Copy card.tsx
  fs.copyFileSync(
    'e:/NODE Projects/stem-education-platform/games/frontend/components/ui/card.tsx',
    'e:/NODE Projects/stem-education-platform/components/ui/card.tsx'
  );
  console.log("Copied card.tsx");

  // Copy badge.tsx
  fs.copyFileSync(
    'e:/NODE Projects/stem-education-platform/games/frontend/components/ui/badge.tsx',
    'e:/NODE Projects/stem-education-platform/components/ui/badge.tsx'
  );
  console.log("Copied badge.tsx");

  // Copy games directory
  copyRecursiveSync(
    'e:/NODE Projects/stem-education-platform/games/frontend/app/games',
    'e:/NODE Projects/stem-education-platform/app/learn/games'
  );
  console.log("Copied games directory");
} catch (e) {
  console.error("Error:", e);
  process.exit(1);
}
