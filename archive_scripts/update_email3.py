import os
import glob

html_files = glob.glob("*.html")
target = "'contact@gearheadzmotorsports.com'"
replacement = "'2gearheadzmotorsports@gmail.com'"

for f in html_files:
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    if target in content:
        content = content.replace(target, replacement)
        with open(f, "w", encoding="utf-8") as file:
            file.write(content)
        print(f"Updated {f}")
