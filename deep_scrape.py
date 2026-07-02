import urllib.request
import re
import ssl
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://www.gearheadzmotorsports.com/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
    # Print the first 1000 characters to see if it's actually the page
    print("HTML Length:", len(html))
    
    # Try to find any URL containing 'cdn.shopify.com' and 'supra' or 'shift'
    # Shopify URLs often look like //www.gearheadzmotorsports.com/cdn/shop/files/Supra...
    # or //cdn.shopify.com/s/files/...
    all_urls = re.findall(r'(https?:)?//[a-zA-Z0-9\-\.\/]+/cdn/shop/files/[a-zA-Z0-9\-\_\.]+\.(?:jpg|png|webp)', html, re.IGNORECASE)
    all_urls_2 = re.findall(r'(https?:)?//cdn\.shopify\.com/s/files/[a-zA-Z0-9\-\.\/]+\.(?:jpg|png|webp)', html, re.IGNORECASE)
    
    found = set([u[1] if isinstance(u, tuple) else u for u in all_urls] + [u[1] if isinstance(u, tuple) else u for u in all_urls_2])
    print("Found total URLs:", len(found))
    
    for match in re.finditer(r'([^\"]+cdn[^\"]+(?:supra|shift)[^\"]*\.(?:jpg|png|webp))', html, re.IGNORECASE):
        print("Found matching URL:", match.group(1))

except Exception as e:
    print('Error:', e)
