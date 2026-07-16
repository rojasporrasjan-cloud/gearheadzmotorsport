import fs from 'fs';
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Remove "Get Tickets" from footers
  content = content.replace(/<a href="\/events\.html" class="f-link">Get Tickets<\/a>\s*/g, '');
  
  // Replace references to tickets in text
  content = content.replace(/event tickets/g, 'events');
  content = content.replace(/drift meet tickets/g, 'drift meets');
  content = content.replace(/Get tickets before they sell out/g, 'Catch us at our next meet');
  
  if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`Updated ${file}`);
  }
}
