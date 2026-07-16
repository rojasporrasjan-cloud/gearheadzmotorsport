import os
import re

new_footer = """  <footer id="footer" class="page-section" style="margin-top:auto;">
    <div class="footer-brand-bar">
      <div class="f-logo">GEAR<em>HEADZ</em></div>
      <div class="f-social">
        <a href="https://instagram.com/2gearheadz" class="f-social-link" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </a>
        <a href="https://wa.me/19088846483" class="f-social-link" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        </a>
      </div>
    </div>
    <div class="footer-grid">
      <div>
        <p class="f-tagline">JDM culture gear for those who live and breathe motorsports. Built different since 2024.</p>
      </div>
      <div>
        <span class="f-col-title">SHOP</span>
        <a href="/store.html" class="f-link">Apparel</a>
        <a href="/store.html" class="f-link">Headwear</a>
        <a href="/store.html" class="f-link">Accessories</a>
        <a href="/store.html" class="f-link">New Drops</a>
      </div>
      <div>
        <span class="f-col-title">EVENTS</span>
        <a href="/events.html" class="f-link">Race Schedule</a>
        <a href="/events.html" class="f-link">Get Tickets</a>
        <a href="/index.html#gallery" class="f-link">Gallery</a>
        <a href="/index.html#about" class="f-link">About</a>
      </div>
      <div>
        <span class="f-col-title">CONNECT</span>
        <a href="https://instagram.com/2gearheadz" target="_blank" rel="noopener noreferrer" class="f-link">Instagram</a>
        <a href="https://wa.me/19088846483" target="_blank" rel="noopener noreferrer" class="f-link">WhatsApp</a>
        <a href="mailto:contact@gearheadzmotorsports.com" class="f-link">Email</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="f-legal">© 2026 GearHeadz Motorsports. All rights reserved.</span>
      <span class="f-legal">
        <a href="/privacy.html" class="f-link" style="display:inline; margin:0 5px; color:#888;">Privacy Policy</a> | 
        <a href="/terms.html" class="f-link" style="display:inline; margin:0 5px; color:#888;">Terms of Service</a> |
        <a href="/shipping-returns.html" class="f-link" style="display:inline; margin:0 5px; color:#888;">Shipping & Returns</a>
      </span>
    </div>
  </footer>"""

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
count = 0
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<footer id="footer"' in content:
        content = re.sub(r'  <footer id="footer"[\s\S]*?</footer>', new_footer, content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
print(f"Updated {count} HTML files.")
