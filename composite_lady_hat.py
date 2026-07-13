import os
from PIL import Image

def process():
    fg_path = r"public\images\products\lady-hat-clear.png"
    bg_path = r"C:\Users\rojas\.gemini\antigravity-ide\brain\b342c7ee-4338-4f68-8e57-93d47dfceb0b\jdm_background_1783903313533.png"
    out_path = r"public\images\products\lady-hat-final-bg.png"
    
    fg = Image.open(fg_path).convert("RGBA")
    
    # Crop transparent borders so the hat itself is centered
    bbox = fg.getbbox()
    if bbox:
        fg = fg.crop(bbox)
        
    bg = Image.open(bg_path).convert("RGBA")
    
    # Resize foreground (hat) to be about 70% of the background width or height
    target_width = int(bg.width * 0.7)
    ratio = target_width / fg.width
    new_fg_size = (int(fg.width * ratio), int(fg.height * ratio))
    fg = fg.resize(new_fg_size, Image.Resampling.LANCZOS)
    
    # Calculate position to center the hat
    x = (bg.width - fg.width) // 2
    y = (bg.height - fg.height) // 2
    
    # Push it down just a tiny bit more for visual balance (optional, but bbox handles most of it)
    y = y + int(bg.height * 0.05)
    
    # Paste foreground onto background using foreground alpha as mask
    bg.paste(fg, (x, y), fg)
    
    bg.save(out_path)
    print("Saved to", out_path)

if __name__ == '__main__':
    process()
