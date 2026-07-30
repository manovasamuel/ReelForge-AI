const fs = require('fs');

const logPath = 'C:\\Users\\acer\\.gemini\\antigravity-ide\\brain\\5a1991bd-60c6-4a51-809b-cd9c9b54d671\\.system_generated\\logs\\transcript_full.jsonl';
const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

let out = "";
for (let i = 0; i < lines.length; i++) {
  try {
    const parsed = JSON.parse(lines[i]);
    if (parsed.type === 'TOOL_RESPONSE' && parsed.content) {
        out += parsed.content + '\n====================\n';
    }
  } catch(e) {}
}

fs.writeFileSync('C:\\Users\\acer\\Desktop\\ReelForge-AI\\all_responses.txt', out);
