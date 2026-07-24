import os
import glob

html_files = glob.glob("*.html")
target = '<a href="mailto:contact@gearheadzmotorsports.com" class="f-link">Email</a>'
replacement = '<a href="#" onclick="event.preventDefault(); navigator.clipboard.writeText(\'contact@gearheadzmotorsports.com\'); import(\'/js/cart.js\').then(m => m.toast(\'Correo copiado al portapapeles\', \'✉️\'));" class="f-link">Email</a>'

for f in html_files:
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    if target in content:
        content = content.replace(target, replacement)
        with open(f, "w", encoding="utf-8") as file:
            file.write(content)
        print(f"Updated {f}")
