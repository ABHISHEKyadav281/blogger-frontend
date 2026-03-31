import { API_BASE_URL, S3_BASE_URL } from "../config";

export const resolveImageUrl = (url: string | null | undefined, placeholder?: string) => {
  if (!url) {
    return placeholder || `https://via.placeholder.com/400`;
  }
  
  if (url.startsWith('http') || url.startsWith('data:image') || url.startsWith('blob:')) {
    return url;
  }
  
  // Normalise the path for checking
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  
  // Handing S3 keys specifically if they start with our bucket Prefix
  if (cleanPath.startsWith('soloblogger/')) {
    const separator = S3_BASE_URL.endsWith('/') ? '' : '/';
    return `${S3_BASE_URL}${separator}${cleanPath}`;
  }
  
  // Strip '/api' from the end of the base URL for static images if it exists
  const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
  const separator = url.startsWith('/') ? '' : '/';
  
  return `${baseUrl}${separator}${url}`;
};

export const resolveAvatarUrl = (avatar: string | null | undefined, username?: string) => {
    const fallback = `https://ui-avatars.com/api/?name=${username || 'User'}&background=random`;
    return resolveImageUrl(avatar, fallback);
};
