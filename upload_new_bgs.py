import cloudinary
import cloudinary.uploader
import json

cloudinary.config(
    cloud_name = "db4ld8cy2",
    api_key = "676712169998135",
    api_secret = "AMOekITVWxB6dIfr-UnAldzTOK8",
    secure = True
)

images = [
    {"path": r"c:\Users\rojas\Desktop\Clientes\headmotorz\public\images\products\jdm-legends-bg.png", "id": "jdm-legends-custom-bg"},
    {"path": r"c:\Users\rojas\Desktop\Clientes\headmotorz\public\images\products\turbo-girl-bg.png", "id": "turbo-girl-custom-bg"},
    {"path": r"c:\Users\rojas\Desktop\Clientes\headmotorz\public\images\products\boosted-bowl-bg.png", "id": "boosted-bowl-custom-bg"},
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

with open("uploaded_urls.json", "w") as f:
    json.dump(results, f, indent=2)
