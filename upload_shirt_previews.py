import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name = "db4ld8cy2",
    api_key = "676712169998135",
    api_secret = "AMOekITVWxB6dIfr-UnAldzTOK8",
    secure = True
)

images = [
    {"path": r"C:\Users\rojas\.gemini\antigravity-ide\brain\952aa5a1-5a50-42c5-b84d-e4d4e76ef55d\preview_toxica_shirt_1.png", "id": "preview_toxica_shirt_1"},
    {"path": r"C:\Users\rojas\.gemini\antigravity-ide\brain\952aa5a1-5a50-42c5-b84d-e4d4e76ef55d\preview_toxica_shirt_2.png", "id": "preview_toxica_shirt_2"},
]

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
    except Exception as e:
        print("Error:", e)
