// Utilidades para procesar archivos (imagenes de ecografia, PDFs previos, etc.)

export function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// Comprime una imagen a un maximo de lado y calidad JPEG.
// Devuelve { blob, dataUrl }. Si falla, cae al archivo original.
export async function compressImage(file, maxDim = 1600, quality = 0.85) {
  try {
    const dataUrl = await readAsDataURL(file);
    const img = await loadImage(dataUrl);
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    const outDataUrl = canvas.toDataURL('image/jpeg', quality);
    const blob = await (await fetch(outDataUrl)).blob();
    return { blob, dataUrl: outDataUrl };
  } catch {
    const dataUrl = await readAsDataURL(file);
    return { blob: file, dataUrl };
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function isImage(file) {
  return file && file.type && file.type.startsWith('image/');
}
