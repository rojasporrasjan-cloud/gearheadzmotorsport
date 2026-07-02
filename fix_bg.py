import os
from PIL import Image

def process(path):
    img = Image.open(path)
    img = img.convert("RGBA")
    datas = img.getdata()
    new_data = []
    for item in datas:
        # Convert near-white pixels to transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    out_path = path.replace('.jpeg', '.png')
    img.save(out_path, "PNG")
    print(f"Saved {out_path}")
    os.remove(path)

try:
    process('public/images/products/Need-speed.jpeg')
    process('public/images/products/honda-civic.jpeg')
except Exception as e:
    print(e)
