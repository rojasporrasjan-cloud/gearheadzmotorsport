import re

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Nav
c = re.sub(r'\s*<a href="/events" class="nav-link"[^>]*>EVENTS</a>', '', c)
# Footer
c = re.sub(r'\s*<a href="/events\.html" class="f-link">Race Schedule</a>', '', c)

# Section
c = re.sub(r'<!--.*?EVENTS PREVIEW.*?-->\s*<section id="events-preview".*?</section>', '', c, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)
