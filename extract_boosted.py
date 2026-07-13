import os
import math
from PIL import Image

def color_dist(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1[:3], c2[:3])))

def extract_shirt(img_path, out_path, tolerance=30):
    print(f"Loading {img_path}...")
    img = Image.open(img_path).convert("RGBA")
    
    width, height = img.size
    pixels = img.load()
    
    bg_color = pixels[0, 0]
    print(f"Background color detected as {bg_color}")
    
    visited = set()
    queue = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    
    for q in queue:
        visited.add(q)
        
    print("Running flood fill...")
    while queue:
        x, y = queue.pop(0)
        
        # Make transparent
        pixels[x, y] = (0, 0, 0, 0)
        
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    # Check tolerance
                    if color_dist(pixels[nx, ny], bg_color) < tolerance:
                        visited.add((nx, ny))
                        queue.append((nx, ny))

    # Anti-aliasing / edge smoothing:
    for y in range(height):
        for x in range(width):
            if pixels[x, y][3] != 0:
                is_edge = False
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height:
                        if pixels[nx, ny][3] == 0:
                            is_edge = True
                            break
                if is_edge:
                    d = color_dist(pixels[x, y], bg_color)
                    if d < tolerance * 2:
                        alpha = int(255 * (d - tolerance) / tolerance)
                        alpha = max(0, min(255, alpha))
                        pixels[x, y] = (pixels[x,y][0], pixels[x,y][1], pixels[x,y][2], alpha)
                        
    img.save(out_path)
    print(f"Saved extracted shirt to {out_path}")
    return img

def composite(bg_path, fg_img, out_path):
    print(f"Compositing onto {bg_path}...")
    bg = Image.open(bg_path).convert("RGBA")
    bg = bg.resize(fg_img.size, Image.Resampling.LANCZOS)
    comp = Image.alpha_composite(bg, fg_img)
    comp.save(out_path)
    print(f"Saved {out_path}")

fg_path = r"c:\Users\rojas\Desktop\Clientes\headmotorz\public\images\products\boosted bowl.jpg"
clear_path = r"c:\Users\rojas\Desktop\Clientes\headmotorz\public\images\products\boosted-bowl-full-clear.png"
bg_path = r"C:\Users\rojas\.gemini\antigravity-ide\brain\952aa5a1-5a50-42c5-b84d-e4d4e76ef55d\bg_boosted_bowl_1783758357214.png"
out_dir = r"C:\Users\rojas\.gemini\antigravity-ide\brain\952aa5a1-5a50-42c5-b84d-e4d4e76ef55d"

fg_img = extract_shirt(fg_path, clear_path, tolerance=25)
composite(bg_path, fg_img, os.path.join(out_dir, "preview_boosted_bowl.png"))
