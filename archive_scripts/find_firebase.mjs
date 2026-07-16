import fs from 'fs';

const lines = fs.readFileSync('C:\\Users\\rojas\\.gemini\\antigravity-ide\\brain\\952aa5a1-5a50-42c5-b84d-e4d4e76ef55d\\.system_generated\\logs\\transcript.jsonl', 'utf8').split('\n');

for (const line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    // Look for tool_calls that are write_to_file or run_command that might have JS code
    if (obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.name === 'write_to_file' || call.name === 'multi_replace_file_content' || call.name === 'run_command') {
          const args = JSON.stringify(call.args);
          if (args.includes('db.collection') || args.includes('cloudinary') || args.includes('.png')) {
            console.log(`Step ${obj.step_index}: ${call.name}`);
            console.log(args.substring(0, 300) + '...');
          }
        }
      }
    }
  } catch (e) {}
}
