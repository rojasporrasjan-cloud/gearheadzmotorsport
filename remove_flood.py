import os
from PIL import Image, ImageDraw

def remove_bg_flood(path):
    img = Image.open(path).convert("RGBA")
    
    # Flood fill from top-left corner
    ImageDraw.floodfill(img, (0, 0), (0, 0, 0, 0), thresh=80)
    # Also top-right, just in case
    w, h = img.size
    ImageDraw.floodfill(img, (w-1, 0), (0, 0, 0, 0), thresh=80)
    
    out_path = path.replace('.png', '-clear.png')
    img.save(out_path, "PNG")
    print(f"Saved {out_path}")

try:
    remove_bg_flood('public/images/products/boosted-bowl.png')
    remove_bg_flood('public/images/products/boosted-bowl-text.png')
    remove_bg_flood('public/images/products/jdm-legends.png')
    remove_bg_flood('public/images/products/jdm-legends-text.png')
except Exception as e:
    print(e)
