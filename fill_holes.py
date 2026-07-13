from PIL import Image

def fill_holes(img_path, out_path):
    print(f"Opening {img_path}")
    img = Image.open(img_path).convert("RGBA")
    
    padded = Image.new("RGBA", (img.width + 2, img.height + 2), (0,0,0,0))
    padded.paste(img, (1, 1))
    
    width, height = padded.size
    pixels = padded.load()
    
    visited = set()
    queue = [(0, 0)]
    
    print("Running BFS for exterior...")
    while queue:
        x, y = queue.pop(0)
        if (x, y) in visited:
            continue
        visited.add((x, y))
        
        # If mostly transparent, it's part of the exterior
        if pixels[x, y][3] < 50:
            pixels[x, y] = (0, 0, 0, 1) # Marker
            
            for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        queue.append((nx, ny))
    
    filled_count = 0
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a < 50:
                if a == 1:
                    pixels[x, y] = (0, 0, 0, 0)
                else:
                    pixels[x, y] = (255, 255, 255, 255)
                    filled_count += 1
            elif a < 255 and a > 50:
                # Blend with white to remove dark halos around holes
                pass

    final = padded.crop((1, 1, width - 1, height - 1))
    final.save(out_path)
    print(f"Filled {filled_count} interior transparent pixels with white.")

fill_holes(r"c:\Users\rojas\Desktop\Clientes\headmotorz\public\images\products\turbo-girl-clear.png", r"c:\Users\rojas\Desktop\Clientes\headmotorz\public\images\products\turbo-girl-fixed.png")
