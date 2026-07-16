import os
from PIL import Image, ImageFilter

def remove_bg_advanced(path):
    if not os.path.exists(path):
        return
        
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    pixels = img.load()
    
    # Sample corner for background color
    bg_color = pixels[0, 0]
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # If it's close to the background color, remove it
            dist = max(abs(r-bg_color[0]), abs(g-bg_color[1]), abs(b-bg_color[2]))
            if dist < 50 or (r>200 and g>200 and b>200):
                pixels[x, y] = (0, 0, 0, 0)
                
    # Filter alpha to remove noise speckles
    alpha = img.split()[-1]
    alpha = alpha.filter(ImageFilter.MinFilter(3)) # erode
    alpha = alpha.filter(ImageFilter.MaxFilter(3)) # dilate back
    img.putalpha(alpha)
    
    out = path.replace('.png', '-clear.png')
    img.save(out, "PNG")
    print(f"Cleared background for {path}")

try:
    remove_bg_advanced('public/images/products/jdm-legends.png')
    remove_bg_advanced('public/images/products/jdm-legends-text.png')
    remove_bg_advanced('public/images/products/turbo-girl.png')
    remove_bg_advanced('public/images/products/boosted-bowl.png')
    remove_bg_advanced('public/images/products/boosted-bowl-text.png')
except Exception as e:
    print(e)
