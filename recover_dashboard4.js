const fs = require('fs');

const logPath = 'C:\\Users\\acer\\.gemini\\antigravity-ide\\brain\\5a1991bd-60c6-4a51-809b-cd9c9b54d671\\.system_generated\\logs\\transcript_full.jsonl';
const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

for (let i = 0; i < lines.length; i++) {
  try {
    const parsed = JSON.parse(lines[i]);
    if (parsed.type === 'TOOL_RESPONSE' && parsed.content && parsed.content.includes('DashboardPage')) {
        fs.writeFileSync(`C:\\Users\\acer\\Desktop\\ReelForge-AI\\dash_response_${i}.txt`, parsed.content);
    }
    if (parsed.tool_calls) {
      for (const call of parsed.tool_calls) {
        if (call.function && call.function.name === 'default_api:write_to_file') {
          const args = typeof call.function.arguments === 'string' ? JSON.parse(call.function.arguments) : call.function.arguments;
          if (args.CodeContent && args.CodeContent.includes('DashboardPage')) {
              fs.writeFileSync(`C:\\Users\\acer\\Desktop\\ReelForge-AI\\dash_write_${i}.tsx`, args.CodeContent);
          }
        }
      }
    }
  } catch(e) {}
}
