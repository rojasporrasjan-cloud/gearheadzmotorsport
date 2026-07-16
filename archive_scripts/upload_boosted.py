import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name = "db4ld8cy2",
    api_key = "676712169998135",
    api_secret = "YOUR_API_SECRET",
    secure = True
)

path = r"C:\Users\rojas\.gemini\antigravity-ide\brain\952aa5a1-5a50-42c5-b84d-e4d4e76ef55d\preview_boosted_bowl.png"

print(f"Uploading {path}...")
try:
    res = cloudinary.uploader.upload(
        path,
        public_id=f"gearheadz/products/preview_boosted_bowl",
        unique_filename=False,
        overwrite=True
    )
    url = res.get("secure_url")
    print("Success:", url)
except Exception as e:
    print("Error:", e)
