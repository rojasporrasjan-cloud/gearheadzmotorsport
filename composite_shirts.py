import os
from PIL import Image

def process(bg_path, fg_path, out_path):
    print(f"Processing {fg_path}...")
    try:
        # Open foreground (shirt) and background
        fg = Image.open(fg_path).convert("RGBA")
        bg = Image.open(bg_path).convert("RGBA")
        
        # Resize background to match foreground
        bg = bg.resize(fg.size, Image.Resampling.LANCZOS)
        
        # Composite foreground over background
        # alpha_composite requires both to be RGBA and same size
        composite = Image.alpha_composite(bg, fg)
        
        # Save output
        composite.save(out_path)
        print(f"Saved to {out_path}")
    except Exception as e:
        print(f"Failed: {e}")

base_dir = r"c:\Users\rojas\Desktop\Clientes\headmotorz\public\images\products"
bg_dir = r"C:\Users\rojas\.gemini\antigravity-ide\brain\952aa5a1-5a50-42c5-b84d-e4d4e76ef55d"

process(
    os.path.join(bg_dir, "bg_jdm_legends_1783758308957.png"),
    os.path.join(base_dir, "jdm-legends-clear.png"),
    os.path.join(base_dir, "jdm-legends-bg.png")
)

process(
    os.path.join(bg_dir, "bg_turbo_girl_1783758332575.png"),
    os.path.join(base_dir, "turbo-girl-clear.png"),
    os.path.join(base_dir, "turbo-girl-bg.png")
)

process(
    os.path.join(bg_dir, "bg_boosted_bowl_1783758357214.png"),
    os.path.join(base_dir, "boosted-bowl-clear.png"),
    os.path.join(base_dir, "boosted-bowl-bg.png")
)
