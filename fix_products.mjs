import fs from 'fs';

let code = fs.readFileSync('js/products.js', 'utf-8');

// Remove GTR tee
code = code.replace(/\{\s*id:\s*'p-gtr'[\s\S]*?\},?\s*/, '');

// Update prices
code = code.replace(/id:\s*'p-forever-static'([\s\S]*?)price:\s*20/g, "id: 'p-forever-static'$1price: 30");
code = code.replace(/id:\s*'p-kids-labubu'([\s\S]*?)price:\s*20/g, "id: 'p-kids-labubu'$1price: 30");
code = code.replace(/id:\s*'p-kids-bluezilla'([\s\S]*?)price:\s*20/g, "id: 'p-kids-bluezilla'$1price: 30");

fs.writeFileSync('js/products.js', code);
console.log('Prices updated and GTR removed');
