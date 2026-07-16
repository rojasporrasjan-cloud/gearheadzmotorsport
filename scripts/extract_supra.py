import os
from PIL import Image

def extract_perfect():
    print("Loading images...")
    clear_path = r"c:\Users\rojas\Desktop\Clientes\headmotorz\public\images\products\supra-tee-clear.png"
    colored_path = r"c:\Users\rojas\Desktop\Clientes\headmotorz\public\images\products\supra tee.jpeg"
    out_path = r"c:\Users\rojas\Desktop\Clientes\headmotorz\public\images\products\supra-tee-perfect.png"
    
    clear_img = Image.open(clear_path).convert("RGBA")
    colored_img = Image.open(colored_path).convert("RGBA")
    
    print("Building mask...")
    padded = Image.new("RGBA", (clear_img.width + 2, clear_img.height + 2), (0,0,0,0))
    padded.paste(clear_img, (1, 1))
    
    width, height = padded.size
    pixels = padded.load()
    
    visited = set()
    queue = [(0, 0)]
    
    while queue:
        x, y = queue.pop(0)
        if (x, y) in visited:
            continue
        visited.add((x, y))
        
        if pixels[x, y][3] < 50:
            pixels[x, y] = (0, 0, 0, 1) 
            
            for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        queue.append((nx, ny))
                        
    mask = Image.new("L", (clear_img.width, clear_img.height), 0)
    mask_pixels = mask.load()
    
    clear_alpha = clear_img.split()[3].load()
    
    for y in range(clear_img.height):
        for x in range(clear_img.width):
            r, g, b, a = pixels[x+1, y+1]
            if a == 1:
                mask_pixels[x, y] = 0
            else:
                orig_a = clear_alpha[x, y]
                if orig_a > 50:
                    mask_pixels[x, y] = orig_a
                else:
                    mask_pixels[x, y] = 255
                    
    print("Applying mask to colored image...")
    colored_img.putalpha(mask)
    
    colored_img.save(out_path)
    print(f"Saved perfect extraction to {out_path}")

extract_perfect()
