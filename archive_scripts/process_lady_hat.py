from PIL import Image

def flood_fill_transparency(img_path, out_path, tolerance=30):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # We assume the top-left corner is the background color
    bg_color = pixels[0, 0][:3]
    
    visited = set()
    queue = [(0, 0)]
    
    # We will mark pixels that belong to the background
    bg_pixels = set()
    
    while queue:
        x, y = queue.pop(0)
        if (x, y) in visited: continue
        visited.add((x, y))
        
        # Check if pixel is within tolerance of bg_color
        r, g, b, a = pixels[x, y]
        diff = abs(r - bg_color[0]) + abs(g - bg_color[1]) + abs(b - bg_color[2])
        if diff <= tolerance:
            bg_pixels.add((x, y))
            for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                    queue.append((nx, ny))
                    
    # Make bg transparent
    for x, y in bg_pixels:
        pixels[x, y] = (0, 0, 0, 0)
        
    img.save(out_path)
    print("Saved transparent image to", out_path)

if __name__ == '__main__':
    in_path = r"public\images\products\lady hat.jpeg"
    out_path = r"public\images\products\lady-hat-clear.png"
    flood_fill_transparency(in_path, out_path, tolerance=40)
