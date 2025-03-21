/**
 * Upload file to qu.ax
 * Supported mimetypes:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`
 * - `video/mp4`
 * - `video/webm`
 * - `audio/mpeg`
 * - `audio/wav`
 * @param {Buffer} buffer File Buffer
 * @return {Promise<string>}
 */
export default async (buffer) => {
  const { fileTypeFromBuffer } = await import('file-type');  // Importación dinámica
  const { ext, mime } = await fileTypeFromBuffer(buffer);
  const { FormData, Blob } = await import('formdata-node');  // Importación dinámica
  const fetch = (await import('node-fetch')).default;  // Importación dinámica

  const form = new FormData();
  const blob = new Blob([buffer.toArrayBuffer()], { type: mime });
  form.append('files[]', blob, 'tmp.' + ext);

  const res = await fetch('https://qu.ax/upload.php', { method: 'POST', body: form });
  const result = await res.json();
  if (result && result.success) {
    return result.files[0].url;
  } else {
    throw new Error('Failed to upload the file to qu.ax');
  }
};