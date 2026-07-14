import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Remove nav link
    content = re.sub(r'\s*<a href="/events(\.html)?" class="nav-link"[^>]*>EVENTS</a>', '', content)
    
    # Remove footer link
    content = re.sub(r'\s*<a href="/events\.html" class="f-link">Race Schedule</a>', '', content)
    
    if f == 'index.html':
        # Remove the events preview section
        content = re.sub(r'\s*<!--\s*.*EVENTS PREVIEW.*?-->\s*', '', content, flags=re.DOTALL)
        content = re.sub(r'<section id="events-preview".*?</section>', '', content, flags=re.DOTALL)
        
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

if os.path.exists('events.html'):
    os.rename('events.html', 'events.html.bak')
print('Removed events links and section.')
