const fs = require('fs');
const path = require('path');

const dirToScan = path.join(__dirname, 'src');

function dedupeBox(content) {
  // Find all imports from lucide-react
  return content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g, (match, importsStr) => {
    // Split imports, trim, remove empty
    let imports = importsStr.split(',').map(s => s.trim()).filter(s => s);
    // Deduplicate
    let uniqueImports = [...new Set(imports)];
    return `import { ${uniqueImports.join(', ')} } from "lucide-react"`;
  });
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = dedupeBox(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Deduped Box imports in: ${fullPath.replace(__dirname, '')}`);
      }
    }
  }
}

processDir(dirToScan);
