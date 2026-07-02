import urllib.request
import re
import ssl
import json
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://www.gearheadzmotorsports.com/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
    # Find all images
    imgs = re.findall(r'(//www\.gearheadzmotorsports\.com/cdn/shop/files/[^\"]+\.(?:jpg|png|webp|jpeg))', html)
    print("Found images:", len(set(imgs)))
    
    # Download images that match 'shift' or 'supra'
    for img in set(imgs):
        img_url = 'https:' + img
        img_url = img_url.split('?')[0] # remove query params
        
        name = img_url.split('/')[-1].lower()
        if 'shift' in name or 'supra' in name or 'white' in name or 'logo' in name:
            print("Downloading:", name)
            target = os.path.join('public', 'images', 'products', name)
            urllib.request.urlretrieve(img_url, target)
            print("Saved as:", target)
except Exception as e:
    print('Error:', e)
