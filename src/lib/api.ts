import axios from 'axios';

const apiBaseUrl =
  import.meta.env?.VITE_API_BASE_URL ??
  (typeof process === 'undefined' ? undefined : process.env.VITE_API_BASE_URL);

if (!apiBaseUrl) {
  throw new Error('Missing VITE_API_BASE_URL');
}

const config = {
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const api = axios.create(config);
