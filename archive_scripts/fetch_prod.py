import urllib.request
import re
import ssl
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_product_image(url, filename):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
        # Look for og:image
        match = re.search(r'<meta property=\"og:image\" content=\"([^\"]+)\"', html)
        if match:
            img_url = match.group(1)
            if img_url.startswith('//'):
                img_url = 'https:' + img_url
            img_url = img_url.split('?')[0] # remove query string
            target = os.path.join('public', 'images', 'products', filename)
            urllib.request.urlretrieve(img_url, target)
            print("Downloaded", filename, "from", img_url)
            return True
        else:
            print("No image found for", url)
    except Exception as e:
        print("Error fetching", url, ":", e)
    return False

fetch_product_image('https://www.gearheadzmotorsports.com/products/shift-shirt', 'shift-shirt.png')
fetch_product_image('https://www.gearheadzmotorsports.com/products/supra-tee', 'supra-tee.png')
