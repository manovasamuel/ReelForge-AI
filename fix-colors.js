const fs = require('fs');
const path = require('path');

const dirToScan = path.join(__dirname, 'src');

function fixColors(content) {
  return content
    .replace(/\btext-(purple|violet|fuchsia|emerald|indigo|blue|pink)-[3456]00(\/[0-9]+)?/g, 'text-foreground')
    .replace(/\bbg-(purple|violet|fuchsia|emerald|indigo|blue|pink)-[3456]00(\/[0-9]+)?/g, 'bg-muted')
    .replace(/\bborder-(purple|violet|fuchsia|emerald|indigo|blue|pink)-[3456]00(\/[0-9]+)?/g, 'border-border')
    .replace(/\bring-(purple|violet|fuchsia|emerald|indigo|blue|pink)-[3456]00(\/[0-9]+)?/g, 'ring-border')
    .replace(/\bfrom-(purple|violet|fuchsia|emerald|indigo|blue|pink)-[3456]00(\/[0-9]+)?/g, 'from-muted')
    .replace(/\bto-(purple|violet|fuchsia|emerald|indigo|blue|pink)-[3456]00(\/[0-9]+)?/g, 'to-muted')
    .replace(/\bvia-(purple|violet|fuchsia|emerald|indigo|blue|pink)-[3456]00(\/[0-9]+)?/g, 'via-muted')
    .replace(/\bshadow-(purple|violet|fuchsia|emerald|indigo|blue|pink)-[3456]00(\/[0-9]+)?/g, 'shadow-sm')
    // Remove gradients
    .replace(/bg-gradient-to-[a-z]+\s+from-muted\s+(via-muted\s+)?to-muted/g, 'bg-muted')
    .replace(/text-transparent\s+bg-clip-text\s+bg-muted/g, 'text-foreground')
    // Settings defaults
    .replace(/accentColor:\s*"(purple|blue|emerald)"/g, 'accentColor: "default"')
    .replace(/type\s+AccentColor\s*=\s*"purple"\s*\|\s*"blue"\s*\|\s*"emerald"/g, 'type AccentColor = "default" | "zinc"');
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = fixColors(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Fixed: ${fullPath.replace(__dirname, '')}`);
      }
    }
  }
}

processDir(dirToScan);
