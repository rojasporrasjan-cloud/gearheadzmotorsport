import cloudinary
import cloudinary.uploader
import json

cloudinary.config(
    cloud_name = "db4ld8cy2",
    api_key = "676712169998135",
    api_secret = "YOUR_API_SECRET",
    secure = True
)

images = [
    {"path": r"C:\Users\rojas\.gemini\antigravity-ide\brain\952aa5a1-5a50-42c5-b84d-e4d4e76ef55d\preview_toxica_1_perfect.png", "id": "preview_toxica_1_perfect"},
    {"path": r"C:\Users\rojas\.gemini\antigravity-ide\brain\952aa5a1-5a50-42c5-b84d-e4d4e76ef55d\preview_toxica_2_perfect.png", "id": "preview_toxica_2_perfect"},
]

results = {}

for img in images:
    print(f"Uploading {img['path']}...")
    try:
        res = cloudinary.uploader.upload(
            img["path"],
            public_id=f"gearheadz/products/{img['id']}",
            unique_filename=False,
            overwrite=True
        )
        url = res.get("secure_url")
        print("Success:", url)
        results[img["id"]] = url
    except Exception as e:
        print("Error:", e)
