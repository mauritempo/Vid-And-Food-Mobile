import { API_URL } from "@env";


async function handleResponse(response){
    const data = await response.json().catch(() => ({}));

    if(!response.ok){
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
        body: JSON.stringify({ email, password })
    });

    return handleResponse(res);
}

export async function registerRequest({ email, password, fullName }) {
    const res = await fetch(`${API_URL}/User/Register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName })
    })

    return handleResponse(res);
}


export const decodeToken = (token) => {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decodificando token:", e);
        return null;
    }
};