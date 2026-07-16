import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name = "db4ld8cy2",
    api_key = "957631876521587",
    api_secret = "YOUR_API_SECRET",
    secure = True
)

print("Testing single upload to root...")
try:
    res = cloudinary.uploader.upload(
        r"public\images\products\180sx-tee.png",
        public_id="180sx-tee-test",
        unique_filename=False,
        overwrite=True
    )
    print("Success:", res.get("secure_url"))
except Exception as e:
    print("Error:", e)
