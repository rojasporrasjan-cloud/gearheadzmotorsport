import sys
from PIL import Image

def shift_down(img_path, out_path, shift_ratio=0.15):
    img = Image.open(img_path).convert("RGB")
    width, height = img.size
    
    shift_pixels = int(height * shift_ratio)
    
    # Create new image
    new_img = Image.new("RGB", (width, height))
    
    # Paste the original image shifted down
    # (It will be cut off at the bottom)
    new_img.paste(img, (0, shift_pixels))
    
    # Fill the top gap by stretching the top row of pixels
    top_row = img.crop((0, 0, width, 1))
    top_stretch = top_row.resize((width, shift_pixels), Image.Resampling.NEAREST)
    new_img.paste(top_stretch, (0, 0))
    
    new_img.save(out_path)
    print("Saved to", out_path)

if __name__ == "__main__":
    shift_down(sys.argv[1], sys.argv[2])
