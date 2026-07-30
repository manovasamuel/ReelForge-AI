const fs = require('fs');

const data = require('./dashboard_mentions.json');
console.log(`Found ${data.length} mentions.`);

for (const line of data) {
  try {
    const parsed = JSON.parse(line);
    
    // Check if it's a tool call to write_to_file
    if (parsed.tool_calls) {
      for (const call of parsed.tool_calls) {
        if (call.function && call.function.name === 'default_api:write_to_file') {
          const args = typeof call.function.arguments === 'string' ? JSON.parse(call.function.arguments) : call.function.arguments;
          if (args.TargetFile && args.TargetFile.includes('dashboard/page.tsx')) {
            console.log("Found write_to_file for dashboard! Writing to dashboard_recovered.tsx");
            fs.writeFileSync('C:\\Users\\acer\\Desktop\\ReelForge-AI\\dashboard_recovered.tsx', args.CodeContent);
            return;
          }
        }
      }
    }
    
    // Check if it's a response from view_file or run_command that contains the full file
    if (parsed.type === 'TOOL_RESPONSE' && parsed.content) {
      if (parsed.content.includes('dashboard/page.tsx') && parsed.content.includes('export default function DashboardPage')) {
        console.log("Found potential content in a tool response!");
        // We'll just write the raw response content to inspect
        fs.appendFileSync('C:\\Users\\acer\\Desktop\\ReelForge-AI\\dashboard_responses.txt', parsed.content + '\n---\n');
      }
    }
  } catch(e) {}
}
