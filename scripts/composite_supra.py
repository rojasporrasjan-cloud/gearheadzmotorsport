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
bg_dir = r"C:\Users\rojas\.gemini\antigravity-ide\brain\952aa5a1-5a50-42c5-b84d-e4d4e76ef55d"

# The original transparent purple shirt
fg_path = os.path.join(base_dir, "supra-tee-perfect.png")
# Using the JDM legends neon background (matches the vibe)
bg_path = os.path.join(bg_dir, "bg_jdm_legends_1783758308957.png")
# Output to a new file
out_path = os.path.join(base_dir, "supra-tee-with-bg.png")

process(bg_path, fg_path, out_path)
