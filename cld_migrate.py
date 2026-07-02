import os
import glob
import cloudinary
import cloudinary.uploader

# Configure Cloudinary with ROOT credentials
cloudinary.config(
    cloud_name = "db4ld8cy2",
    api_key = "676712169998135",
    api_secret = "AMOekITVWxB6dIfr-UnAldzTOK8",
    secure = True
)

# Paths
img_dir = os.path.join("public", "images", "products")
products_js_path = os.path.join("js", "products.js")

def upload_images():
    print("Starting Cloudinary migration with Root key...")
    
    # 1. Upload images
    files = glob.glob(os.path.join(img_dir, "*.*"))
    for file in files:
        if not file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            continue
            
        filename = os.path.basename(file)
        name_no_ext = os.path.splitext(filename)[0]
        public_id = f"gearheadz/products/{name_no_ext}"
        
        print(f"Uploading {filename}...")
        try:
            res = cloudinary.uploader.upload(
                file,
                public_id=public_id,
                unique_filename=False,
                overwrite=True
            )
            print(" -> Success:", res.get("secure_url"))
        except Exception as e:
            print(" -> Error uploading:", e)

    # 2. Update products.js
    print("Updating products.js...")
    with open(products_js_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    cld_base = "https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/"
    new_content = content.replace("'/images/products/", f"'{cld_base}")
    
    with open(products_js_path, "w", encoding="utf-8") as f:
        f.write(new_content)
        
    print("Migration complete!")

if __name__ == "__main__":
    upload_images()
