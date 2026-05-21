export const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const token = localStorage.getItem('authToken');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`/api${url.startsWith('/') ? url : '/' + url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
};
