import fs from 'fs';
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(/<a href="\/events"[^>]*>EVENTS<\/a>\s*/g, '');
  content = content.replace(/<a href="\/events\.html"[^>]*>Race Schedule<\/a>\s*/g, '');
  content = content.replace(/<a href="\/events\.html"[^>]*>Get Tickets<\/a>\s*/g, '');
  
  if (file === 'index.html') {
      content = content.replace(/<section id="events-preview"[\s\S]*?<\/section>\s*/g, '');
      content = content.replace(/<a href="\/events"[^>]*>VIEW EVENTS<\/a>\s*/g, '');
      content = content.replace(/<a href="\/events"[^>]*>OUR EVENTS<\/a>\s*/g, '');
      content = content.replace(/First access to drops, event tickets, and JDM culture/ig, 'First access to drops and JDM culture');
  }
  
  if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`Updated ${file}`);
  }
}
