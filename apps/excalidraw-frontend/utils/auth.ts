import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  userId: string;
  iat: number;
}

export function getAdminId(): string | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.userId;
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
}
