// ── CLOUDINARY CONFIG ─────────────────────────────
// 1. Ve a https://cloudinary.com → Dashboard
// 2. Copia tu Cloud name
// 3. Settings → Upload → Add upload preset → Signing Mode: Unsigned
// 4. Pega el nombre del preset abajo

const CLOUD_NAME    = "YOUR_CLOUD_NAME";
const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";

export const isConfigured = CLOUD_NAME !== "YOUR_CLOUD_NAME";

async function cloudinaryUpload(file, resourceType = 'image', folder = 'gearheadz') {
  if (!isConfigured) throw new Error('Cloudinary no configurado — edita js/cloudinary.js');
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('folder', folder);

  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

export const uploadImage = (file, folder = 'gearheadz/products') =>
  cloudinaryUpload(file, 'image', folder);

export const uploadVideo = (file, folder = 'gearheadz/hero') =>
  cloudinaryUpload(file, 'video', folder);
