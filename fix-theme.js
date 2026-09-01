const fs = require('fs');
const path = require('path');

const dirToScan = path.join(__dirname, 'src');

function fixTheme(content) {
  return content
    // Replace hardcoded dark-mode background colors with semantic Tailwind variables
    .replace(/\bbg-gray-900\/[0-9]+\b/g, 'bg-card')
    .replace(/\bbg-gray-900\b/g, 'bg-card')
    .replace(/\bbg-[#0f172a]\b/g, 'bg-card')
    .replace(/\bbg-gray-800\/[0-9]+\b/g, 'bg-muted')
    .replace(/\bbg-gray-800\b/g, 'bg-muted')
    
    // Replace hardcoded borders
    .replace(/\bborder-gray-800\b/g, 'border-border')
    .replace(/\bborder-gray-700\b/g, 'border-border')
    .replace(/\bborder-gray-900\b/g, 'border-border')
    .replace(/\bhover:border-gray-700\b/g, 'hover:border-primary/50')
    
    // Replace hardcoded text colors that disappear on light mode
    .replace(/\btext-gray-400\b/g, 'text-muted-foreground')
    .replace(/\btext-gray-300\b/g, 'text-muted-foreground')
    .replace(/\btext-gray-200\b/g, 'text-foreground')
    
    // Hover states for backgrounds
    .replace(/\bhover:bg-gray-800\/[0-9]+\b/g, 'hover:bg-muted')
    .replace(/\bhover:bg-gray-800\b/g, 'hover:bg-muted')
    .replace(/\bhover:bg-gray-700\b/g, 'hover:bg-muted')
    
    // Strip leftover purple/violet/emerald from mock data/UI
    .replace(/Purple/g, 'Primary')
    .replace(/purple/g, 'primary')
    .replace(/Violet/g, 'Primary')
    .replace(/violet/g, 'primary')
    .replace(/Fuchsia/g, 'Primary')
    .replace(/fuchsia/g, 'primary')
    .replace(/Emerald/g, 'Primary')
    .replace(/emerald/g, 'primary')
    .replace(/#7C3AED/g, '#0A0A0A') // old purple to black/primary
    .replace(/#6D28D9/g, '#0A0A0A')
    
    // Remove emojis/Sparkles imports and usage
    .replace(/Sparkles/g, 'Box')
    .replace(/Film/g, 'Box')
    .replace(/Box(,\s*Box)+/g, 'Box'); // Fix duplicate imports if Sparkles and Film were both imported
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = fixTheme(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Updated theme semantics: ${fullPath.replace(__dirname, '')}`);
      }
    }
  }
}

processDir(dirToScan);
