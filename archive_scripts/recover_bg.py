import os
import math
from PIL import Image

def recover_transparency(path):
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    center = (w/2, h/2)
    max_dist = math.hypot(w/2, h/2)
    
    pixels = img.load()
    for y in range(h):
        for x in range(w):
            dist = math.hypot(x - center[0], y - center[1])
            ratio = min(dist / max_dist, 1.0)
            
            # Recreate the exact background pixel
            r_bg = int(25 * (1 - ratio) + 3 * ratio)
            g_bg = int(25 * (1 - ratio) + 7 * ratio)
            b_bg = int(30 * (1 - ratio) + 13 * ratio)
            
            r, g, b, a = pixels[x, y]
            
            # If the pixel is exactly the background, make it transparent
            if abs(r - r_bg) <= 2 and abs(g - g_bg) <= 2 and abs(b - b_bg) <= 2:
                pixels[x, y] = (0, 0, 0, 0)
                
    # Save as recovered
    out_path = path.replace('.png', '-clear.png')
    img.save(out_path, "PNG")
    print(f"Recovered {out_path}")

try:
    recover_transparency('public/images/products/Need-speed.png')
    recover_transparency('public/images/products/honda-civic.png')
except Exception as e:
    print(e)
