const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'store.html',
  'terms.html',
  'privacy.html',
  'shipping-returns.html',
  'success.html',
  'cancel.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replacements
  content = content.replace(/JDM culture gear/gi, 'Automotive culture gear');
  content = content.replace(/JDM culture apparel/gi, 'Automotive culture apparel');
  content = content.replace(/JDM apparel/gi, 'Automotive apparel');
  content = content.replace(/JDM clothing/gi, 'Automotive clothing');
  content = content.replace(/JDM CULTURE IN MOTION/gi, 'AUTOMOTIVE CULTURE IN MOTION');
  content = content.replace(/JDM culture/gi, 'car culture');
  content = content.replace(/JDM legend/gi, 'Motorsports legend');
  content = content.replace(/JDM icon/gi, 'Motorsports icon');
  content = content.replace(/JDM street racing/gi, 'Street racing');
  content = content.replace(/JDM race grid/gi, 'Race grid');
  content = content.replace(/JDM/g, 'Automotive');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated', file);
});
