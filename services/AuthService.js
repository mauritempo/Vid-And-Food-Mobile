import { decode as base64Decode } from 'base-64';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || 'Error al comunicarse con el servidor';
    throw new Error(message);
  }

  return data;
}

export async function loginRequest({ email, password }) {
  const res = await fetch(`${API_URL}/User/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(res);
}

export async function registerRequest({ email, password, fullName }) {
  const res = await fetch(`${API_URL}/User/Register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, fullName }),
  });

  return handleResponse(res);
}

export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      base64Decode(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decodificando token:', e);
    return null;
  }
};

export const mapClaimsToUser = (claims) => {
  if (!claims) return null;

  const id =
    claims[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
    ] ?? claims.sub ?? claims.id;

  const email =
    claims[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
    ] ?? claims.email;

  const role =
    claims[
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    ] ?? claims.role ?? claims.Role ?? 'User';

  const fullName =
    claims[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
    ] ?? claims.fullName ?? claims.name;

  return {
    id,
    email,
    role,
    fullName,
    exp: claims.exp,
    raw: claims,
  };
};
