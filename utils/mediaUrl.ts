export function getPublicMediaBase(apiUrl?: string | null, publicUrl?: string | null): string {
  const configuredPublicUrl = String(publicUrl || '').trim().replace(/\/+$/, '');

  if (configuredPublicUrl) {
    return configuredPublicUrl;
  }

  return String(apiUrl || '').trim().replace(/\/+$/, '').replace(/\/api$/, '') + '/storage';
}

export function normalizeMediaUrl(value?: string | null, apiUrl?: string | null, publicUrl?: string | null): string {
  if (!value) {
    return '';
  }

  const path = String(value).trim();

  if (!path) {
    return '';
  }

  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  const mediaBase = getPublicMediaBase(apiUrl, publicUrl);

  if (path.startsWith('/api/storage/')) {
    return `${mediaBase}/${path.replace(/^\/api\/storage\/+/, '')}`;
  }

  if (path.startsWith('/storage/')) {
    return `${mediaBase}/${path.replace(/^\/storage\/+/, '')}`;
  }

  if (path.startsWith('storage/')) {
    return `${mediaBase}/${path.replace(/^storage\/+/, '')}`;
  }

  return `${mediaBase}/${path.replace(/^\/+/, '')}`;
}
