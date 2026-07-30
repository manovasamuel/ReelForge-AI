const fs = require('fs');

const data = require('./dashboard_mentions2.json');

for (let i = 0; i < data.length; i++) {
  try {
    const parsed = JSON.parse(data[i]);
    
    // If it's a tool call to write_to_file
    if (parsed.tool_calls) {
      for (const call of parsed.tool_calls) {
        if (call.function && call.function.name === 'default_api:write_to_file') {
          const args = typeof call.function.arguments === 'string' ? JSON.parse(call.function.arguments) : call.function.arguments;
          fs.writeFileSync(`C:\\Users\\acer\\Desktop\\ReelForge-AI\\dashboard_recovered_write_${i}.tsx`, args.CodeContent);
        }
      }
    }
    
    // If it's a view_file response
    if (parsed.type === 'TOOL_RESPONSE' && parsed.content) {
      fs.writeFileSync(`C:\\Users\\acer\\Desktop\\ReelForge-AI\\dashboard_recovered_view_${i}.txt`, parsed.content);
    }
  } catch(e) {}
}
