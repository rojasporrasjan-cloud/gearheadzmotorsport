const fs = require('fs');
const glob = ['js/events-data.js'];
for (const file of glob) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/when tickets go live/g, 'when events go live');
  if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(Updated );
  }
}

