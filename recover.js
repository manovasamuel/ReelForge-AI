const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:\\Users\\acer\\.gemini\\antigravity-ide\\brain\\5a1991bd-60c6-4a51-809b-cd9c9b54d671\\.system_generated\\logs\\transcript_full.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let marketingVersions = [];
  let dashboardVersions = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line);
      if (parsed.tool_calls) {
        for (const call of parsed.tool_calls) {
          if (call.function && call.function.name === 'default_api:write_to_file') {
            try {
              const args = typeof call.function.arguments === 'string' ? JSON.parse(call.function.arguments) : call.function.arguments;
              if (args.TargetFile && args.TargetFile.includes('(marketing)') && args.TargetFile.endsWith('page.tsx')) {
                marketingVersions.push(args.CodeContent);
              }
              if (args.TargetFile && args.TargetFile.includes('(app)') && args.TargetFile.includes('dashboard') && args.TargetFile.endsWith('page.tsx')) {
                dashboardVersions.push(args.CodeContent);
              }
            } catch(e) {}
          }
        }
      }
    } catch(err) {}
  }
  
  marketingVersions.forEach((v, i) => {
    fs.writeFileSync(`C:\\Users\\acer\\Desktop\\ReelForge-AI\\src\\app\\(marketing)\\page_v${i}.tsx`, v);
  });
  
  dashboardVersions.forEach((v, i) => {
    fs.writeFileSync(`C:\\Users\\acer\\Desktop\\ReelForge-AI\\src\\app\\(app)\\dashboard\\page_v${i}.tsx`, v);
  });
  
  console.log(`Saved ${marketingVersions.length} versions of marketing page`);
  console.log(`Saved ${dashboardVersions.length} versions of dashboard page`);
}

processLineByLine();
