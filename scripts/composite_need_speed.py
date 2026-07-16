import os
from PIL import Image

def process(bg_path, fg_path, out_path):
    print(f"Processing {fg_path}...")
    try:
        fg = Image.open(fg_path).convert("RGBA")
        bg = Image.open(bg_path).convert("RGBA")
        
        bg = bg.resize(fg.size, Image.Resampling.LANCZOS)
        composite = Image.alpha_composite(bg, fg)
        
        composite.save(out_path)
        print(f"Saved to {out_path}")
    except Exception as e:
        print(f"Failed: {e}")

base_dir = r"c:\Users\rojas\Desktop\Clientes\headmotorz\public\images\products"

fg_path = os.path.join(base_dir, "need-speed-perfect.png")
bg_path = os.path.join(base_dir, "jdm-legends-bg.png")
out_path = os.path.join(base_dir, "need-speed-with-bg.png")

process(bg_path, fg_path, out_path)
