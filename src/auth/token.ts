export interface DecodedToken {
  user_id: number;
  username: string;
  exp: number;
}

export const saveToken = (token: string): void => {
  localStorage.setItem('prode_token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('prode_token');
};

export const removeToken = (): void => {
  localStorage.removeItem('prode_token');
};

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
};
