export const API_BASE_URL = 'http://localhost:3000/api';

interface APIOptions extends RequestInit {
    token?: string;
}

export async function apiRequest<T>(endpoint: string, options: APIOptions = {}): Promise<T> {
    const { token, headers, ...customConfig } = options;
    const storedToken = localStorage.getItem('authToken');
    const itemsToken = token || storedToken;

    const config: RequestInit = {
        ...customConfig,
        headers: {
            'Content-Type': 'application/json',
            ...(itemsToken && { Authorization: `Bearer ${itemsToken}` }),
            ...headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        let errorMessage = 'Something went wrong';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
            // Cannot parse error json, stick to default
        }
        throw new Error(errorMessage);
    }

    return response.json(); // Assumes all successful responses return JSON
}

export function getFileUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Already absolute URL
    if (path.startsWith('/uploads')) {
        return `http://localhost:3000${path}`;
    }
    return path;
}
