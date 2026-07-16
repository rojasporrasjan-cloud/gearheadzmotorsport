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

fg_path = r"c:\Users\rojas\Desktop\Clientes\headmotorz\public\images\products\turbo-girl-perfect.png"
bg1 = r"C:\Users\rojas\.gemini\antigravity-ide\brain\952aa5a1-5a50-42c5-b84d-e4d4e76ef55d\bg_toxica_garage_1783805831765.png"
bg2 = r"C:\Users\rojas\.gemini\antigravity-ide\brain\952aa5a1-5a50-42c5-b84d-e4d4e76ef55d\bg_toxica_street_1783805844014.png"

out_dir = r"C:\Users\rojas\.gemini\antigravity-ide\brain\952aa5a1-5a50-42c5-b84d-e4d4e76ef55d"

process(bg1, fg_path, os.path.join(out_dir, "preview_toxica_1_perfect.png"))
process(bg2, fg_path, os.path.join(out_dir, "preview_toxica_2_perfect.png"))
