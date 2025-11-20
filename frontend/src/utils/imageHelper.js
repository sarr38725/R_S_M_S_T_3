// src/utils/imageHelper.js
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

function buildUrl(path) {
  if (!path) return null;

  // already absolute URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // starts with / → treat as backend-relative path
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }

  // otherwise assume it's an image id
  return `${API_BASE_URL}/api/images/${path}`;
}

export const getImageUrl = (image) => {
  if (image === null || image === undefined) return null;

  // number → id
  if (typeof image === 'number') {
    return buildUrl(String(image));
  }

  // string → could be id, relative path, or full url
  if (typeof image === 'string') {
    return buildUrl(image);
  }

  // object: { url } or { id }
  if (typeof image === 'object') {
    if (image.url) return buildUrl(image.url);
    if (image.id != null) return buildUrl(String(image.id));
  }

  return null;
};

export const getImageUrls = (images) => {
  if (!images) return [];
  if (!Array.isArray(images)) {
    const one = getImageUrl(images);
    return one ? [one] : [];
  }
  return images.map(getImageUrl).filter(Boolean);
};
