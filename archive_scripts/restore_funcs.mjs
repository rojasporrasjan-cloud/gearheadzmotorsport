import fs from 'fs';

const oldContent = fs.readFileSync('js/products_old.js', 'utf16le');
const newContent = fs.readFileSync('js/products.js', 'utf8');

// Find where the helper functions start in the old file
const funcStart = oldContent.indexOf('function escapeHTML');
if (funcStart !== -1) {
    const funcs = oldContent.substring(funcStart - 1);
    fs.writeFileSync('js/products.js', newContent + '\n' + funcs);
    console.log('Appended missing functions to products.js');
} else {
    // try to find bindCards directly
    const bindStart = oldContent.indexOf('export function bindCards');
    if (bindStart !== -1) {
        console.log('Found bindCards but not escapeHTML. Did it find something else?');
    }
    console.log('Could not find functions in products_old.js with utf16le');
}
