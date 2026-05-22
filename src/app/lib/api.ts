const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const API_BASE_URL = `${API_URL}/api`;

interface APIOptions extends RequestInit {
  token?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: APIOptions = {},
): Promise<T> {
  const { token, headers, ...customConfig } = options;
  const storedToken = localStorage.getItem("authToken");
  const itemsToken = token || storedToken;

  const config: RequestInit = {
    ...customConfig,
    headers: {
      "Content-Type": "application/json",
      ...(itemsToken && { Authorization: `Bearer ${itemsToken}` }),
      ...headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage = "Something went wrong";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }

  return response.json();
}

export function getFileUrl(path?: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  if (path.startsWith("/uploads")) {
    return `${API_URL}${path}`;
  }

  return path;
}
