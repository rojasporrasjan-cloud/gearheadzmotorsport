import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace href="page.html" with href="/page"
    # Or href="./page.html" with href="/page"
    # Also handle href="index.html" -> href="/"
    
    # Let's be careful. We only replace known local HTML pages.
    pages = ['index', 'store', 'events', 'admin', 'privacy', 'terms', 'shipping-returns']
    
    new_content = content
    for page in pages:
        # replace in HTML (href)
        if page == 'index':
            # index.html should go to /
            new_content = re.sub(r'href=[\'"]\/?(?:.\/)?index\.html[\'"]', 'href="/"', new_content)
            new_content = re.sub(r'window\.location\.href\s*=\s*[\'"]\/?(?:.\/)?index\.html[\'"]', 'window.location.href = "/"', new_content)
        else:
            new_content = re.sub(fr'href=[\'"]\/?(?:.\/)?{page}\.html[\'"]', f'href="/{page}"', new_content)
            new_content = re.sub(fr'window\.location\.href\s*=\s*[\'"]\/?(?:.\/)?{page}\.html[\'"]', f'window.location.href = "/{page}"', new_content)
            
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'dist' in root:
        continue
    for file in files:
        if file.endswith('.html') or file.endswith('.js'):
            process_file(os.path.join(root, file))
