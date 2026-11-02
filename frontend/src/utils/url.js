/**
 * Resolves the backend server URL cleanly.
 * Prepends https:// if missing (e.g. Render 'property: host' env injection).
 */
export function getServerUrl() {
  let url = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
  url = url.trim();
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url.replace(/\/+$/, '');
}

export default getServerUrl;
