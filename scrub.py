import glob, re
for f in glob.glob("*.py"):
    with open(f, "r") as file:
        content = file.read()
    new_content = re.sub(r"api_secret\s*=\s*['\"].*?['\"]", 'api_secret = "YOUR_API_SECRET"', content)
    if content != new_content:
        with open(f, "w") as file:
            file.write(new_content)
        print(f"Scrubbed {f}")
