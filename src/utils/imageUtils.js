export const getOptimizedImageUrl = (url, width = 400) => {
  if (!url) {
    return "https://via.placeholder.com/300x400/CCCCCC/666666?text=No+Image";
  }

  if (!url.includes('cloudinary.com')) {
    return url;
  }

  return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto,c_fill/`);
};