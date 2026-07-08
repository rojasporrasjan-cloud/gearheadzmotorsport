import os
import re

new_footer = """  <footer id="footer" class="page-section" style="margin-top:auto;">
    <div class="footer-brand-bar">
      <div class="f-logo">GEAR<em>HEADZ</em></div>
      <div class="f-social">
        <a href="https://instagram.com/2gearheadz" class="f-social-link" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </a>
        <a href="https://tiktok.com/@2gearheadz" class="f-social-link" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
        </a>
        <a href="https://youtube.com/@2gearheadz" class="f-social-link" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
        </a>
        <a href="https://facebook.com/2gearheadz" class="f-social-link" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
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
        <a href="https://tiktok.com/@2gearheadz" target="_blank" rel="noopener noreferrer" class="f-link">TikTok</a>
        <a href="https://youtube.com/@2gearheadz" target="_blank" rel="noopener noreferrer" class="f-link">YouTube</a>
        <a href="mailto:contact@gearheadzmotorsports.com" class="f-link">Contact</a>
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
