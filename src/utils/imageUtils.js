// src/utils/imageUtils.js

/**
 * Optimiza URLs de Cloudinary para reducir el tamaño y mejorar la carga.
 * Si la imagen no es de Cloudinary o es nula, devuelve un placeholder o la original.
 */
export const getOptimizedImageUrl = (url, width = 400) => {
  // 1. Si no hay URL, devolvemos un placeholder genérico
  if (!url) {
    return "https://via.placeholder.com/300x400/CCCCCC/666666?text=No+Image";
  }

  // 2. Si la URL no es de Cloudinary, la devolvemos tal cual (no podemos optimizarla con este método)
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  // 3. Inyectamos los parámetros de transformación de Cloudinary
  // /upload/ -> /upload/w_400,f_auto,q_auto,c_fill/
  // w_400: Ancho de 400px (ajustable)
  // f_auto: Formato automático (WebP en Android, etc.)
  // q_auto: Calidad automática (reduce peso sin perder calidad visual)
  // c_fill: Recorta la imagen para llenar el espacio sin deformar
  return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto,c_fill/`);
};