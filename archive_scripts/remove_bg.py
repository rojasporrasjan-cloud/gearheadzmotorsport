import sys
import subprocess

try:
    import PIL
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])

from PIL import Image

def remove_white_bg(img_path):
    try:
        img = Image.open(img_path)
        img = img.convert("RGBA")
        datas = img.getdata()
        
        new_data = []
        for item in datas:
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(img_path, "PNG")
        print("Background removed for:", img_path)
    except Exception as e:
        print("Error processing", img_path, ":", e)

if __name__ == '__main__':
    path = r"public\images\products\turbi-pillow-plushie.png"
    remove_white_bg(path)
