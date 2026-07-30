const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:\\Users\\acer\\.gemini\\antigravity-ide\\brain\\5a1991bd-60c6-4a51-809b-cd9c9b54d671\\.system_generated\\logs\\transcript_full.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let foundDashboardContent = [];

  for await (const line of rl) {
    if (line.includes('dashboard/page.tsx')) {
        foundDashboardContent.push(line);
    }
  }
  
  fs.writeFileSync('C:\\Users\\acer\\Desktop\\ReelForge-AI\\dashboard_mentions.json', JSON.stringify(foundDashboardContent, null, 2));
}

processLineByLine();
